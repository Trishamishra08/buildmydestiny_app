import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const fail = (res, status, message) => res.status(status).json({ success: false, message });

// Strip Mongo internals and anything a client must not control.
const clean = (doc) => {
  if (!doc) return doc;
  const { _id, __v, ...rest } = doc;
  return rest;
};

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
    const [productCount, orders] = await Promise.all([
      Product.countDocuments({ vendorId }),
      Order.find({ 'items.product.vendorId': vendorId }).lean(),
    ]);

    let revenue = 0;
    let orderCount = 0;
    for (const order of orders) {
      const items = (order.items || []).filter((line) => String(line?.product?.vendorId) === vendorId);
      if (!items.length) continue;
      orderCount += 1;
      revenue += items.reduce((acc, line) => acc + (line.lineTotal ?? line.price * line.quantity ?? 0), 0);
    }

    res.json({ success: true, data: { productCount, orderCount, revenue } });
  } catch (error) {
    next(error);
  }
};

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

    const doc = {
      ...clean(req.body || {}),
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
    const { notFound, forbidden } = await loadOwnedProduct(req);
    if (notFound) return fail(res, 404, 'Product not found');
    if (forbidden) return fail(res, 403, 'You can only edit your own products');

    const { id: _id, vendorId: _vendorId, ...fields } = clean(req.body || {});
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
      const items = (order.items || []).filter((line) => String(line?.product?.vendorId) === vendorId);
      const vendorTotal = items.reduce((acc, line) => acc + (line.lineTotal ?? line.price * line.quantity ?? 0), 0);
      return clean({ ...order, items, vendorTotal });
    });

    res.json({ success: true, count: scoped.length, data: scoped });
  } catch (error) {
    next(error);
  }
};

const ITEM_STATUSES = ['Processing', 'Ready to Ship', 'Shipped', 'Delivered'];

/**
 * @desc    Update the fulfilment status of the vendor's own line item within an order
 * @route   PATCH /api/vendor/orders/:orderId/items/:productId/status
 * @access  Private (vendor, owner of that line item only)
 */
export const updateMyOrderItemStatus = async (req, res, next) => {
  try {
    const vendorId = String(req.user._id);
    const { status } = req.body || {};
    if (!ITEM_STATUSES.includes(status)) {
      return fail(res, 400, `Status must be one of: ${ITEM_STATUSES.join(', ')}`);
    }

    const order = await Order.findOne({ id: req.params.orderId }).lean();
    if (!order) return fail(res, 404, 'Order not found');

    let found = null;
    const nextItems = (order.items || []).map((line) => {
      if (
        String(line?.product?.id) === req.params.productId &&
        String(line?.product?.vendorId) === vendorId
      ) {
        found = { ...line, vendorStatus: status };
        return found;
      }
      return line;
    });

    if (!found) return fail(res, 403, 'This item does not belong to you');

    await Order.updateOne({ id: req.params.orderId }, { $set: { items: nextItems } });
    res.json({ success: true, data: found });
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
