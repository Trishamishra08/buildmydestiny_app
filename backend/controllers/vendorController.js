import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import DeliveryZone from '../models/DeliveryZone.js';
import {
  VENDOR_ITEM_STATUSES,
  rollupFromItems,
  buildShipments,
  canMoveItemStatus,
  statusLabel,
} from '../utils/orderFlow.js';

const fail = (res, status, message) => res.status(status).json({ success: false, message });

// Strip Mongo internals and anything a client must not control.
const clean = (doc) => {
  if (!doc) return doc;
  const { _id, __v, ...rest } = doc;
  return rest;
};

// A vendor only ever sees (and earns from) their own line items of an order.
const vendorLines = (order, vendorId) =>
  (order.items || []).filter((line) => String(line?.product?.vendorId) === String(vendorId));
const lineSum = (items) => items.reduce((acc, line) => acc + (line.lineTotal ?? (line.price || 0) * (line.quantity || 0)), 0);

const slowestItemStatus = (items) =>
  items
    .map((line) => line.vendorStatus || 'Processing')
    .sort((a, b) => VENDOR_ITEM_STATUSES.indexOf(a) - VENDOR_ITEM_STATUSES.indexOf(b))[0] || 'Processing';

const isApprovedVendor = (req) => req.user?.role === 'vendor' && req.user?.vendorStatus === 'approved';

/**
 * @desc  Vendor blocked from write actions (product create/edit) until an admin approves
 *        their account. They can still view their own profile/status while pending.
 */
const requireApprovedVendor = (req, res, next) => {
  if (!isApprovedVendor(req)) {
    return fail(res, 403, 'Your vendor account is pending admin approval');
  }
  next();
};

/**
 * @desc    Get the signed-in vendor's own profile
 * @route   GET /api/vendor/me
 * @access  Private (vendor)
 */
export const getVendorProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password').lean();
    if (!user) return fail(res, 404, 'Vendor not found');
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update the signed-in vendor's own profile
 * @route   PUT /api/vendor/me
 * @access  Private (vendor)
 */
export const updateVendorProfile = async (req, res, next) => {
  try {
    const allowed = ['businessName', 'phone', 'address', 'gstin', 'city', 'company'];
    const update = {};
    for (const field of allowed) {
      if (req.body?.[field] !== undefined) update[field] = req.body[field];
    }
    // Zones this vendor delivers to (must be real zones; empty = all zones).
    if (req.body?.serviceZones !== undefined) {
      const ids = [...new Set((Array.isArray(req.body.serviceZones) ? req.body.serviceZones : []).map(String))];
      const known = await DeliveryZone.find({ id: { $in: ids } }).select('id').lean();
      if (known.length !== ids.length) return fail(res, 400, 'One or more delivery zones do not exist');
      update.serviceZones = ids;
    }
    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true, runValidators: true })
      .select('-password')
      .lean();
    res.json({ success: true, data: user });
  } catch (error) {
    if (error?.name === 'ValidationError') return fail(res, 400, error.message);
    next(error);
  }
};

/**
 * @desc    Dashboard stats for the signed-in vendor
 * @route   GET /api/vendor/stats
 * @access  Private (vendor)
 */
export const getVendorStats = async (req, res, next) => {
  try {
    const vendorId = String(req.user._id);
    const [products, orders] = await Promise.all([
      Product.find({ vendorId }).select('stockCount inStock').lean(),
      Order.find({ 'items.product.vendorId': vendorId }).sort({ _id: -1 }).lean(),
    ]);

    let revenue = 0;
    let deliveredRevenue = 0;
    let pendingOrders = 0;
    let deliveredOrders = 0;
    const recentOrders = [];
    for (const order of orders) {
      const items = vendorLines(order, vendorId);
      if (!items.length) continue;
      const total = lineSum(items);
      revenue += total;
      const allDelivered = items.every((line) => line.vendorStatus === 'Delivered');
      if (allDelivered) {
        deliveredOrders += 1;
        deliveredRevenue += total;
      } else if (!/cancel/i.test(String(order.status))) {
        pendingOrders += 1;
      }
      if (recentOrders.length < 5) {
        recentOrders.push({
          id: order.id,
          orderNumber: order.orderNumber || order.id,
          customerName: order.customerName || 'Customer',
          // The vendor's own progress: their slowest item.
          status: slowestItemStatus(items),
          vendorTotal: total,
          createdAt: order.createdAt,
        });
      }
    }

    res.json({
      success: true,
      data: {
        productCount: products.length,
        lowStockCount: products.filter((p) => p.inStock !== false && Number(p.stockCount) <= 10).length,
        outOfStockCount: products.filter((p) => p.inStock === false || Number(p.stockCount) === 0).length,
        orderCount: pendingOrders + deliveredOrders,
        pendingOrders,
        deliveredOrders,
        revenue,
        deliveredRevenue,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const newVendorProductId = async () => {
  for (let attempt = 0; attempt < 8; attempt++) {
    const id = `vprod_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    if (!(await Product.exists({ id }))) return id;
  }
  return `vprod_${Date.now()}`;
};

/**
 * @desc    List the signed-in vendor's own products
 * @route   GET /api/vendor/products
 * @access  Private (vendor)
 */
export const listMyProducts = async (req, res, next) => {
  try {
    const docs = await Product.find({ vendorId: String(req.user._id) }).sort({ _id: -1 }).lean();
    res.json({ success: true, count: docs.length, data: docs.map(clean) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a product owned by the signed-in vendor
 * @route   POST /api/vendor/products
 * @access  Private (vendor, approved only)
 */
export const createMyProduct = async (req, res, next) => {
  try {
    let id = req.body?.id ? String(req.body.id).trim() : '';
    if (!id || (await Product.exists({ id }))) id = await newVendorProductId();

    const body = clean(req.body || {});
    const price = Number(body.price) || 0;
    const mrp = Number(body.mrp) || price;
    const stockCount = Number(body.stockCount) || 0;
    const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    // Storefront fields the customer app relies on get sensible defaults; the vendor's own
    // values win. Ownership is always stamped from the signed-in vendor.
    const doc = {
      rating: 4.5,
      reviewsCount: 0,
      moq: 1,
      isFeatured: false,
      isPopular: false,
      ...body,
      slug: body.slug || slugify(body.name),
      price,
      mrp,
      stockCount,
      inStock: body.inStock !== false && stockCount > 0,
      discountPercent,
      discount: discountPercent ? `${discountPercent}% OFF` : '',
      id,
      vendorId: String(req.user._id),
      vendorName: req.user.businessName || req.user.name || 'Vendor',
    };

    const created = await Product.create(doc);
    res.status(201).json({ success: true, data: clean(created.toJSON()) });
  } catch (error) {
    if (error?.name === 'ValidationError') return fail(res, 400, error.message);
    if (error?.code === 11000) return fail(res, 409, 'A product with this id already exists');
    next(error);
  }
};

const loadOwnedProduct = async (req) => {
  const product = await Product.findOne({ id: req.params.key }).lean();
  if (!product) return { notFound: true };
  if (String(product.vendorId) !== String(req.user._id)) return { forbidden: true };
  return { product };
};

/**
 * @desc    Update a product owned by the signed-in vendor
 * @route   PUT/PATCH /api/vendor/products/:key
 * @access  Private (vendor, approved only, owner only)
 */
export const updateMyProduct = async (req, res, next) => {
  try {
    const { notFound, forbidden, product } = await loadOwnedProduct(req);
    if (notFound) return fail(res, 404, 'Product not found');
    if (forbidden) return fail(res, 403, 'You can only edit your own products');

    const { id: _id, vendorId: _vendorId, vendorName: _vendorName, ...fields } = clean(req.body || {});

    // Keep the derived storefront fields in step with price / stock edits.
    const price = fields.price !== undefined ? Number(fields.price) || 0 : undefined;
    const mrp = fields.mrp !== undefined ? Number(fields.mrp) || 0 : undefined;
    const stockCount = fields.stockCount !== undefined ? Number(fields.stockCount) || 0 : undefined;
    if (price !== undefined) fields.price = price;
    if (stockCount !== undefined) {
      fields.stockCount = stockCount;
      if (fields.inStock !== false) fields.inStock = stockCount > 0;
    }
    if (price !== undefined || mrp !== undefined) {
      const effectivePrice = price ?? Number(product.price) ?? 0;
      const effectiveMrp = Math.max(mrp ?? Number(product.mrp) ?? 0, effectivePrice);
      fields.mrp = effectiveMrp;
      const pct = effectiveMrp > effectivePrice ? Math.round(((effectiveMrp - effectivePrice) / effectiveMrp) * 100) : 0;
      fields.discountPercent = pct;
      fields.discount = pct ? `${pct}% OFF` : '';
    }
    const saved = await Product.findOneAndUpdate(
      { id: req.params.key },
      { $set: fields },
      { new: true, runValidators: true }
    ).lean();
    res.json({ success: true, data: clean(saved) });
  } catch (error) {
    if (error?.name === 'ValidationError') return fail(res, 400, error.message);
    next(error);
  }
};

/**
 * @desc    Delete a product owned by the signed-in vendor
 * @route   DELETE /api/vendor/products/:key
 * @access  Private (vendor, owner only)
 */
export const deleteMyProduct = async (req, res, next) => {
  try {
    const { notFound, forbidden } = await loadOwnedProduct(req);
    if (notFound) return res.json({ success: true, deleted: 0 });
    if (forbidden) return fail(res, 403, 'You can only delete your own products');

    const result = await Product.deleteOne({ id: req.params.key });
    res.json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List orders that contain at least one of the signed-in vendor's products.
 *          Each order is trimmed to just that vendor's line items.
 * @route   GET /api/vendor/orders
 * @access  Private (vendor)
 */
export const listMyOrders = async (req, res, next) => {
  try {
    const vendorId = String(req.user._id);
    const orders = await Order.find({ 'items.product.vendorId': vendorId }).sort({ _id: -1 }).lean();

    const scoped = orders.map((order) => {
      const items = vendorLines(order, vendorId);
      return clean({ ...order, items, vendorTotal: lineSum(items) });
    });

    res.json({ success: true, count: scoped.length, data: scoped });
  } catch (error) {
    next(error);
  }
};

const ITEM_STATUSES = VENDOR_ITEM_STATUSES;

/**
 * Move a vendor's line items of an order to `status`, keep that vendor's shipment (rider,
 * history) in step and roll the order status up. Delivery is run by the vendor, so this is
 * the only place fulfilment progress is written.
 *
 * @param productId  limit the change to one line item (omit to move all of the vendor's items)
 * @returns {{ error?: [number, string], order?, items? }}
 */
const advanceVendorItems = async ({ orderId, vendorId, productId, status, rider = {}, note = '' }) => {
  if (!ITEM_STATUSES.includes(status)) {
    return { error: [400, `Status must be one of: ${ITEM_STATUSES.join(', ')}`] };
  }
  const order = await Order.findOne({ id: orderId }).lean();
  if (!order) return { error: [404, 'Order not found'] };
  if (/cancel/i.test(String(order.status))) return { error: [409, 'This order has been cancelled'] };

  const mine = (line) =>
    String(line?.product?.vendorId) === vendorId && (!productId || String(line?.product?.id) === productId);
  const targets = (order.items || []).filter(mine);
  if (!targets.length) return { error: [403, 'This item does not belong to you'] };

  const pending = targets.filter((line) => (line.vendorStatus || 'Processing') !== status);
  if (pending.some((line) => !canMoveItemStatus(line.vendorStatus, status))) {
    return { error: [409, `Order is already past "${status}" - status can only move forward`] };
  }

  const items = (order.items || []).map((line) => (pending.includes(line) ? { ...line, vendorStatus: status } : line));

  // The vendor's shipment records who is delivering and when each step happened.
  const now = new Date().toISOString();
  const shipments = (order.shipments?.length ? order.shipments : buildShipments(order.items, order)).map((s) => {
    if (String(s.vendorId) !== vendorId) return s;
    const cleanRider = Object.fromEntries(
      ['name', 'phone', 'vehicleNumber'].map((k) => [k, String(rider[k] ?? s.rider?.[k] ?? '').trim().slice(0, 60)])
    );
    return {
      ...s,
      rider: cleanRider,
      history: pending.length
        ? [...(s.history || []), { status, label: statusLabel(status), note: String(note || '').slice(0, 200), at: now }]
        : s.history,
    };
  });

  const rollup = rollupFromItems(items, order.tracking || {});
  const mineShipment = shipments.find((s) => String(s.vendorId) === vendorId);
  const update = { items, shipments, ...(rollup || {}) };
  // The order-level tracking card shows the latest rider the customer should expect.
  if (mineShipment?.rider?.name) {
    update.tracking = {
      ...(update.tracking || order.tracking || {}),
      driverName: mineShipment.rider.name,
      driverPhone: mineShipment.rider.phone,
      vehicleNumber: mineShipment.rider.vehicleNumber,
    };
  }
  if (rollup?.statusCode === 'delivered' && /cash|pay on site|pending/i.test(String(order.paymentStatus || ''))) {
    update.paymentStatus = 'Paid (Cash Collected)';
    update.payment = { ...(order.payment || {}), status: 'Paid (Cash Collected)' };
  }

  await Order.updateOne({ id: orderId }, { $set: update });
  return {
    order: { id: order.id, status: update.status || order.status },
    items: targets.map((line) => ({ ...line, vendorStatus: status })),
  };
};

const sendAdvance = (res, result, pick = (r) => r.items) =>
  result.error ? fail(res, result.error[0], result.error[1]) : res.json({ success: true, data: pick(result), order: result.order });

const riderFrom = (body = {}) => ({ name: body.driverName, phone: body.driverPhone, vehicleNumber: body.vehicleNumber });

/**
 * @desc    Update the fulfilment status of the vendor's own line item within an order
 * @route   PATCH /api/vendor/orders/:orderId/items/:productId/status
 * @access  Private (vendor, owner of that line item only)
 */
export const updateMyOrderItemStatus = async (req, res, next) => {
  try {
    const result = await advanceVendorItems({
      orderId: req.params.orderId,
      vendorId: String(req.user._id),
      productId: req.params.productId,
      status: req.body?.status,
      rider: riderFrom(req.body),
      note: req.body?.note,
    });
    sendAdvance(res, result, (r) => r.items[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update the whole of the vendor's part of an order in one go (Ready to Ship ->
 *          Shipped -> Out for Delivery -> Delivered), optionally with the delivery person's
 *          details. The customer follows this on their tracking screen.
 * @route   PATCH /api/vendor/orders/:orderId/status
 *          { status, driverName?, driverPhone?, vehicleNumber?, note? }
 * @access  Private (vendor)
 */
export const updateMyOrderStatus = async (req, res, next) => {
  try {
    const result = await advanceVendorItems({
      orderId: req.params.orderId,
      vendorId: String(req.user._id),
      status: req.body?.status,
      rider: riderFrom(req.body),
      note: req.body?.note,
    });
    sendAdvance(res, result);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// Admin: manage vendor accounts (approve / reject onboarding)
// ---------------------------------------------------------------------------

/**
 * @desc    List all vendor accounts
 * @route   GET /api/vendor/admin/list
 * @access  Private (admin)
 */
export const listVendors = async (req, res, next) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).select('-password').sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: vendors.length, data: vendors });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve or reject a vendor account
 * @route   PATCH /api/vendor/admin/:id/status
 * @access  Private (admin)
 */
export const setVendorStatus = async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return fail(res, 400, 'Status must be one of: pending, approved, rejected');
    }

    const vendor = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'vendor' },
      { $set: { vendorStatus: status } },
      { new: true }
    )
      .select('-password')
      .lean();

    if (!vendor) return fail(res, 404, 'Vendor not found');
    res.json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
};

export { requireApprovedVendor };
