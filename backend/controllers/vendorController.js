import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import DeliveryZone from '../models/DeliveryZone.js';
import Category from '../models/Category.js';
import DeliveryMan from '../models/DeliveryMan.js';
import Setting from '../models/Setting.js';
import {
  GST_SLABS,
  GSTIN_RE,
  PAN_RE,
  IFSC_RE,
  HSN_RE,
  PINCODE_RE,
  isValidGstSlab,
  lineSettlement,
  sumSettlements,
} from '../utils/gst.js';
import { DEFAULT_ETA_MINUTES } from '../utils/deliveryZones.js';
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

/** Everything a vendor must fill in before they are fully set up, and how far along they are. */
const profileChecklist = (u = {}) => {
  const has = (v) => Boolean(String(v ?? '').trim());
  const checks = [
    ['businessName', 'Business name', has(u.businessName)],
    ['businessType', 'Business type', has(u.businessType)],
    ['phone', 'Mobile number', has(u.phone)],
    ['pan', 'PAN', has(u.pan)],
    ['gstin', 'GSTIN', !u.gstRegistered || has(u.gstin)],
    [
      'pickupAddress',
      'Pickup / store address',
      has(u.pickupAddress?.street) && has(u.pickupAddress?.city) && has(u.pickupAddress?.state) && has(u.pickupAddress?.pincode),
    ],
    [
      'bankDetails',
      'Bank account for payouts',
      has(u.bankDetails?.accountNumber) && has(u.bankDetails?.ifsc) && has(u.bankDetails?.accountHolder),
    ],
    ['serviceZones', 'Delivery zones', (u.serviceZones || []).length > 0],
  ];
  const missing = checks.filter(([, , ok]) => !ok).map(([key, label]) => ({ key, label }));
  return { percent: Math.round(((checks.length - missing.length) / checks.length) * 100), missing };
};

const withCompletion = (user) => ({ ...user, profileCompletion: profileChecklist(user) });

/**
 * @desc    Get the signed-in vendor's own profile (with how complete it is)
 * @route   GET /api/vendor/me
 * @access  Private (vendor)
 */
export const getVendorProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password').lean();
    if (!user) return fail(res, 404, 'Vendor not found');
    res.json({ success: true, data: withCompletion(user) });
  } catch (error) {
    next(error);
  }
};

const str = (v, max = 200) => String(v ?? '').trim().slice(0, max);

/**
 * Validate and normalise the profile fields a vendor may edit. Returns { update } or { error }.
 */
const parseProfile = async (body = {}, current = {}) => {
  const update = {};
  for (const field of ['businessName', 'company', 'city', 'businessType', 'businessDescription', 'logo']) {
    if (body[field] !== undefined) update[field] = str(body[field], field === 'businessDescription' ? 600 : 200);
  }
  if (update.businessName === '') return { error: 'Business name cannot be empty' };

  for (const field of ['phone', 'supportPhone']) {
    if (body[field] !== undefined) {
      const digits = str(body[field], 20).replace(/[^\d+]/g, '');
      if (digits && !/^(\+91)?0?[6-9]\d{9}$/.test(digits)) return { error: 'Enter a valid 10 digit mobile number' };
      update[field] = digits;
    }
  }

  if (body.gstRegistered !== undefined) update.gstRegistered = Boolean(body.gstRegistered);
  const registered = update.gstRegistered ?? current.gstRegistered;
  if (body.gstin !== undefined) {
    const gstin = str(body.gstin, 15).toUpperCase();
    if (gstin && !GSTIN_RE.test(gstin)) return { error: 'GSTIN must be 15 characters, e.g. 23ABCDE1234F1Z5' };
    update.gstin = gstin;
  }
  if (registered && !(update.gstin ?? current.gstin)) return { error: 'Enter your GSTIN, or switch off "GST registered"' };

  if (body.pan !== undefined) {
    const pan = str(body.pan, 10).toUpperCase();
    if (pan && !PAN_RE.test(pan)) return { error: 'PAN must look like ABCDE1234F' };
    update.pan = pan;
  }

  if (body.address && typeof body.address === 'object') {
    update.address = Object.fromEntries(['street', 'city', 'state', 'pincode'].map((k) => [k, str(body.address[k])]));
  }
  if (body.pickupAddress && typeof body.pickupAddress === 'object') {
    const a = Object.fromEntries(['street', 'landmark', 'city', 'state', 'pincode'].map((k) => [k, str(body.pickupAddress[k])]));
    if (a.pincode && !PINCODE_RE.test(a.pincode)) return { error: 'Pickup address pincode must be 6 digits' };
    update.pickupAddress = a;
    // Keep the legacy address in step so existing screens still show the store location.
    update.address = { street: a.street, city: a.city, state: a.state, pincode: a.pincode };
  }

  if (body.bankDetails && typeof body.bankDetails === 'object') {
    const b = body.bankDetails;
    const bank = {
      accountHolder: str(b.accountHolder, 100),
      accountNumber: str(b.accountNumber, 20).replace(/\s+/g, ''),
      ifsc: str(b.ifsc, 11).toUpperCase(),
      bankName: str(b.bankName, 100),
      upiId: str(b.upiId, 80),
    };
    if (bank.accountNumber && !/^\d{9,18}$/.test(bank.accountNumber)) return { error: 'Account number must be 9 to 18 digits' };
    if (bank.ifsc && !IFSC_RE.test(bank.ifsc)) return { error: 'IFSC must look like HDFC0001234' };
    update.bankDetails = bank;
  }

  if (body.isAcceptingOrders !== undefined) update.isAcceptingOrders = Boolean(body.isAcceptingOrders);

  // Zones this vendor delivers to (must be real zones; empty = all zones).
  if (body.serviceZones !== undefined) {
    const ids = [...new Set((Array.isArray(body.serviceZones) ? body.serviceZones : []).map(String))];
    const known = await DeliveryZone.find({ id: { $in: ids } }).select('id').lean();
    if (known.length !== ids.length) return { error: 'One or more delivery zones do not exist' };
    update.serviceZones = ids;
  }
  return { update };
};

/**
 * @desc    Update the signed-in vendor's own profile
 * @route   PUT /api/vendor/me
 * @access  Private (vendor)
 */
export const updateVendorProfile = async (req, res, next) => {
  try {
    const current = await User.findById(req.user._id).select('-password').lean();
    const { update, error } = await parseProfile(req.body, current || {});
    if (error) return fail(res, 400, error);
    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true, runValidators: true })
      .select('-password')
      .lean();
    res.json({ success: true, data: withCompletion(user) });
  } catch (error) {
    if (error?.name === 'ValidationError') return fail(res, 400, error.message);
    next(error);
  }
};

/**
 * @desc    Everything the vendor panel needs to render its forms from live data: GST slabs,
 *          the admin's categories (with their default GST / HSN / commission), delivery
 *          zones, the order status flow and the platform defaults.
 * @route   GET /api/vendor/meta
 * @access  Private (vendor)
 */
export const getVendorMeta = async (req, res, next) => {
  try {
    const [categories, zones, settingDoc] = await Promise.all([
      Category.find({ isActive: { $ne: false } }).sort({ name: 1 }).lean(),
      DeliveryZone.find({ active: { $ne: false } }).sort({ name: 1 }).lean(),
      Setting.findOne({ key: 'site' }).lean(),
    ]);
    const num = (v, d) => (v === undefined || v === null || v === '' || Number.isNaN(Number(v)) ? d : Number(v));
    res.json({
      success: true,
      data: {
        gstSlabs: GST_SLABS,
        defaultGstRate: num(settingDoc?.gstRatePercent, 18),
        isGstInclusive: Boolean(settingDoc?.isGstInclusive),
        defaultCommissionPercent: num(settingDoc?.commissionPercent, 0),
        defaultEtaMinutes: DEFAULT_ETA_MINUTES,
        statuses: VENDOR_ITEM_STATUSES,
        businessTypes: ['Manufacturer', 'Distributor', 'Wholesaler', 'Dealer', 'Retailer'],
        categories: categories.map(({ _id, __v, ...c }) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          section: c.section,
          subcategories: c.subcategories || [],
          gstRatePercent: c.gstRatePercent ?? null,
          hsnCode: c.hsnCode ?? '',
          commissionPercent: c.commissionPercent ?? null,
        })),
        zones: zones.map(({ _id, __v, ...z }) => ({
          id: z.id,
          name: z.name,
          city: z.city,
          pincodes: z.pincodes || [],
          etaMinutes: z.etaMinutes || DEFAULT_ETA_MINUTES,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

const settlementContext = (req, order) => ({
  vendorState: req.user?.pickupAddress?.state || req.user?.address?.state,
  shipState: (order.siteAddress || order.shippingAddress || {}).state,
});

/**
 * @desc    Dashboard stats for the signed-in vendor, including GST collected, platform
 *          commission and what is payable to them.
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
    let delayedOrders = 0;
    const settled = [];
    const pendingPayout = [];
    const recentOrders = [];
    for (const order of orders) {
      const items = vendorLines(order, vendorId);
      if (!items.length) continue;
      if (/cancel/i.test(String(order.status))) continue;
      const total = lineSum(items);
      revenue += total;
      const parts = items.map((line) => lineSettlement(line, settlementContext(req, order)));
      const allDelivered = items.every((line) => line.vendorStatus === 'Delivered');
      if (allDelivered) {
        deliveredOrders += 1;
        deliveredRevenue += total;
        settled.push(...parts);
      } else {
        pendingOrders += 1;
        pendingPayout.push(...parts);
        if (order.promisedBy && new Date(order.promisedBy) < new Date()) delayedOrders += 1;
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
          promisedBy: order.promisedBy || null,
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
        delayedOrders,
        revenue,
        deliveredRevenue,
        earnings: {
          delivered: sumSettlements(settled),
          inProgress: sumSettlements(pendingPayout),
        },
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

// The only fields a vendor may set on a product. Ownership, ratings, featuring and
// commission are controlled by the platform.
const VENDOR_PRODUCT_FIELDS = [
  'name',
  'subtitle',
  'brand',
  'unit',
  'moq',
  'description',
  'image',
  'gallery',
  'specifications',
  'variants',
  'wholesaleTiers',
  'warranty',
  'tags',
];

const subName = (s) => (s && typeof s === 'object' ? s.name ?? s.label ?? '' : String(s ?? ''));

/**
 * Validate a vendor's product input against the live catalogue rules: the category must be
 * one the admin created and keeps active, prices and stock must make sense, and tax details
 * must be valid GST slabs / HSN codes. Returns { fields } to store, or { error }.
 *
 * @param existing  the stored product when editing (unchanged fields keep their value)
 */
const buildProductFields = async (body = {}, existing = null) => {
  const f = {};
  for (const key of VENDOR_PRODUCT_FIELDS) if (body[key] !== undefined) f[key] = body[key];

  // Quick edits (stock toggle, price change) only validate what they send.
  const isEdit = Boolean(existing);
  const name = str(f.name ?? existing?.name, 160);
  if (name.length < 3) return { error: 'Product name must be at least 3 characters' };
  f.name = name;
  for (const key of ['subtitle', 'brand', 'unit', 'warranty']) if (f[key] !== undefined) f[key] = str(f[key], 80);
  if (f.description !== undefined) f.description = str(f.description, 4000);
  if (!(f.unit ?? existing?.unit) && (!isEdit || body.unit !== undefined)) {
    return { error: 'Please enter the unit (bag, piece, kg ...)' };
  }

  // Category is the admin's: look it up instead of trusting the names sent by the browser.
  if (!isEdit || body.categorySlug !== undefined) {
    const slug = body.categorySlug ?? existing?.categorySlug;
    const category = slug ? await Category.findOne({ slug, isActive: { $ne: false } }).lean() : null;
    if (!category) return { error: 'Choose one of the categories created by the admin' };
    f.category = category.name;
    f.categorySlug = category.slug;
    f.section = category.section || '';
    const sub = body.subcategory !== undefined ? str(body.subcategory) : existing?.subcategory;
    if (sub) {
      const allowed = (category.subcategories || []).map(subName);
      if (!allowed.includes(sub)) return { error: `"${sub}" is not a sub category of ${category.name}` };
    }
    f.subcategory = sub || '';
  }

  // Price, MRP and stock
  const price = body.price !== undefined ? Number(body.price) : Number(existing?.price);
  if (!Number.isFinite(price) || price <= 0) return { error: 'Selling price must be greater than 0' };
  let mrp = body.mrp !== undefined && body.mrp !== '' ? Number(body.mrp) : Number(existing?.mrp) || price;
  if (!Number.isFinite(mrp) || mrp < price) mrp = price;
  const stockCount = Math.floor(body.stockCount !== undefined ? Number(body.stockCount) : Number(existing?.stockCount ?? 0));
  if (!Number.isFinite(stockCount) || stockCount < 0) return { error: 'Stock cannot be negative' };
  f.price = price;
  f.mrp = mrp;
  f.stockCount = stockCount;
  f.moq = Math.max(1, Math.floor(Number(f.moq ?? existing?.moq ?? 1)) || 1);
  f.inStock = (body.inStock ?? existing?.inStock) !== false && stockCount > 0;
  const pct = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  f.discountPercent = pct;
  f.discount = pct ? `${pct}% OFF` : '';

  // Tax: empty means "use the category default"
  if (body.gstRatePercent !== undefined) {
    if (body.gstRatePercent === '' || body.gstRatePercent === null) f.gstRatePercent = null;
    else if (!isValidGstSlab(body.gstRatePercent)) return { error: `GST rate must be one of ${GST_SLABS.join('%, ')}%` };
    else f.gstRatePercent = Number(body.gstRatePercent);
  }
  if (body.hsnCode !== undefined) {
    const hsn = str(body.hsnCode, 8);
    if (hsn && !HSN_RE.test(hsn)) return { error: 'HSN code must be 4 to 8 digits' };
    f.hsnCode = hsn;
  }

  // Bulk pricing and variants: arrays of well-formed rows only
  if (f.wholesaleTiers !== undefined) {
    const tiers = (Array.isArray(f.wholesaleTiers) ? f.wholesaleTiers : [])
      .map((t) => ({ minQty: Math.floor(Number(t?.minQty)), price: Number(t?.price) }))
      .filter((t) => t.minQty > 1 && t.price > 0);
    if (tiers.some((t) => t.price > price)) return { error: 'Bulk prices cannot be higher than the selling price' };
    f.wholesaleTiers = tiers.slice(0, 10);
  }
  if (f.variants !== undefined) f.variants = (Array.isArray(f.variants) ? f.variants : []).slice(0, 30);
  if (f.gallery !== undefined) f.gallery = (Array.isArray(f.gallery) ? f.gallery : []).filter(Boolean).slice(0, 10);

  return { fields: f };
};

/** Rate / HSN a product is actually charged at: its own, else the category's, else the site's. */
const withEffectiveTax = (product, categoryBySlug, siteRate) => {
  const category = categoryBySlug.get(product.categorySlug);
  const own = product.gstRatePercent;
  const hasOwn = own !== undefined && own !== null && own !== '';
  const inherited = category?.gstRatePercent;
  const hasInherited = inherited !== undefined && inherited !== null && inherited !== '';
  return {
    ...product,
    effectiveGstRate: hasOwn ? Number(own) : hasInherited ? Number(inherited) : siteRate,
    gstSource: hasOwn ? 'product' : hasInherited ? 'category' : 'site',
    effectiveHsn: product.hsnCode || category?.hsnCode || '',
  };
};

/**
 * @desc    List the signed-in vendor's own products (with the GST each one is charged at)
 * @route   GET /api/vendor/products
 * @access  Private (vendor)
 */
export const listMyProducts = async (req, res, next) => {
  try {
    const [docs, categories, settingDoc] = await Promise.all([
      Product.find({ vendorId: String(req.user._id) }).sort({ _id: -1 }).lean(),
      Category.find({}).lean(),
      Setting.findOne({ key: 'site' }).lean(),
    ]);
    const bySlug = new Map(categories.map((c) => [c.slug, c]));
    const siteRate = Number.isNaN(Number(settingDoc?.gstRatePercent)) || settingDoc?.gstRatePercent == null || settingDoc?.gstRatePercent === '' ? 18 : Number(settingDoc.gstRatePercent);
    res.json({ success: true, count: docs.length, data: docs.map((d) => clean(withEffectiveTax(d, bySlug, siteRate))) });
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
    const { fields, error } = await buildProductFields(req.body);
    if (error) return fail(res, 400, error);

    const requested = req.body?.id ? String(req.body.id).trim() : '';
    const id = requested && !(await Product.exists({ id: requested })) ? requested : await newVendorProductId();

    // Storefront fields the customer app relies on get sensible defaults. Ownership is
    // always stamped from the signed-in vendor.
    const created = await Product.create({
      rating: 4.5,
      reviewsCount: 0,
      isFeatured: false,
      isPopular: false,
      ...fields,
      slug: slugify(fields.name),
      id,
      vendorId: String(req.user._id),
      vendorName: req.user.businessName || req.user.name || 'Vendor',
    });
    res.status(201).json({ success: true, data: clean(created.toJSON()) });
  } catch (err) {
    if (err?.name === 'ValidationError') return fail(res, 400, err.message);
    if (err?.code === 11000) return fail(res, 409, 'A product with this id already exists');
    next(err);
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

    const { fields, error } = await buildProductFields(req.body, product);
    if (error) return fail(res, 400, error);
    if (req.body?.name !== undefined && fields.name !== product.name) fields.slug = slugify(fields.name);

    const saved = await Product.findOneAndUpdate({ id: req.params.key }, { $set: fields }, { new: true, runValidators: true }).lean();
    res.json({ success: true, data: clean(saved) });
  } catch (err) {
    if (err?.name === 'ValidationError') return fail(res, 400, err.message);
    next(err);
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
 *          Each order is trimmed to just that vendor's line items, with the GST,
 *          commission and payout of every line, the delivery deadline and rider.
 * @route   GET /api/vendor/orders
 * @access  Private (vendor)
 */
export const listMyOrders = async (req, res, next) => {
  try {
    const vendorId = String(req.user._id);
    const orders = await Order.find({ 'items.product.vendorId': vendorId }).sort({ _id: -1 }).lean();
    const now = Date.now();

    const scoped = orders.map((order) => {
      const items = vendorLines(order, vendorId);
      const ctx = settlementContext(req, order);
      const lines = items.map((line) => ({ ...line, settlement: lineSettlement(line, ctx) }));
      const settlement = sumSettlements(lines.map((l) => l.settlement));
      const shipment = (order.shipments || []).find((s) => String(s.vendorId) === vendorId) || null;
      const unpaid = !/^paid/i.test(String(order.paymentStatus || order.payment?.status || ''));
      const done = lines.every((l) => l.vendorStatus === 'Delivered');
      const promised = order.promisedBy ? new Date(order.promisedBy).getTime() : null;
      // Shipments and other vendors' details are not exposed; only this vendor's own part.
      const { shipments: _all, ...rest } = order;
      return clean({
        ...rest,
        items: lines,
        vendorTotal: lineSum(items),
        settlement,
        // Cash the delivery person must collect for this vendor's items (pay-on-delivery orders only).
        collectOnDelivery: unpaid ? settlement.taxable + settlement.gstAmount : 0,
        shipment: shipment && { rider: shipment.rider, history: shipment.history },
        minutesLeft: promised && !done ? Math.round((promised - now) / 60000) : null,
        isDelayed: Boolean(promised && !done && promised < now),
      });
    });

    res.json({ success: true, count: scoped.length, data: scoped });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// Delivery team: people the vendor saves once and picks when shipping an order
// ---------------------------------------------------------------------------

const MAX_DELIVERY_MEN = 50;
const VEHICLE_TYPES = ['Bike', 'Auto', 'Mini truck', 'Pickup', 'Truck', 'Tempo', 'Other'];
const VEHICLE_NO_RE = /^[A-Z]{2}\s?\d{1,2}\s?[A-Z]{0,3}\s?\d{1,4}$/;

/** How many undelivered orders each saved delivery person is currently carrying. */
const activeDeliveryCounts = async (vendorId, ids) => {
  if (!ids.length) return new Map();
  const orders = await Order.find({
    shipments: { $elemMatch: { vendorId, 'rider.deliveryManId': { $in: ids } } },
  }).lean();
  const counts = new Map();
  for (const order of orders) {
    if (/cancel/i.test(String(order.status))) continue;
    const mine = vendorLines(order, vendorId);
    if (!mine.length || mine.every((l) => l.vendorStatus === 'Delivered')) continue;
    const shipment = (order.shipments || []).find((s) => String(s.vendorId) === vendorId);
    const id = shipment?.rider?.deliveryManId;
    if (id) counts.set(id, (counts.get(id) || 0) + 1);
  }
  return counts;
};

const parseDeliveryMan = (body = {}, existing = null) => {
  const name = str(body.name ?? existing?.name, 80);
  if (name.length < 2) return { error: 'Enter the delivery person\'s name' };
  const digits = str(body.phone ?? existing?.phone, 20).replace(/[^\d+]/g, '');
  if (!/^(\+91)?0?[6-9]\d{9}$/.test(digits)) return { error: 'Enter a valid 10 digit mobile number' };
  const phone = digits.slice(-10);
  const vehicleType = str(body.vehicleType ?? existing?.vehicleType, 30);
  if (vehicleType && !VEHICLE_TYPES.includes(vehicleType)) return { error: `Vehicle type must be one of: ${VEHICLE_TYPES.join(', ')}` };
  const vehicleNumber = str(body.vehicleNumber ?? existing?.vehicleNumber, 20).toUpperCase();
  if (vehicleNumber && !VEHICLE_NO_RE.test(vehicleNumber)) return { error: 'Vehicle number looks wrong, e.g. MP09 AB 1234' };
  return {
    fields: {
      name,
      phone,
      vehicleType,
      vehicleNumber,
      notes: str(body.notes ?? existing?.notes, 200),
      active: (body.active ?? existing?.active) !== false,
    },
  };
};

/**
 * @desc    The vendor's saved delivery people, with how many orders each is carrying now
 * @route   GET /api/vendor/delivery-men
 * @access  Private (vendor)
 */
export const listDeliveryMen = async (req, res, next) => {
  try {
    const vendorId = String(req.user._id);
    const docs = await DeliveryMan.find({ vendorId }).sort({ name: 1 }).lean();
    const counts = await activeDeliveryCounts(vendorId, docs.map((d) => d.id));
    res.json({
      success: true,
      count: docs.length,
      data: docs.map((d) => ({ ...clean(d), activeDeliveries: counts.get(d.id) || 0 })),
      vehicleTypes: VEHICLE_TYPES,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save a delivery person
 * @route   POST /api/vendor/delivery-men
 * @access  Private (vendor)
 */
export const createDeliveryMan = async (req, res, next) => {
  try {
    const vendorId = String(req.user._id);
    const { fields, error } = parseDeliveryMan(req.body);
    if (error) return fail(res, 400, error);
    if ((await DeliveryMan.countDocuments({ vendorId })) >= MAX_DELIVERY_MEN) {
      return fail(res, 400, `You can save up to ${MAX_DELIVERY_MEN} delivery people`);
    }
    if (await DeliveryMan.exists({ vendorId, phone: fields.phone })) {
      return fail(res, 409, 'A delivery person with this mobile number is already saved');
    }
    const created = await DeliveryMan.create({ id: `dman_${Date.now()}_${Math.floor(Math.random() * 10000)}`, vendorId, ...fields });
    res.status(201).json({ success: true, data: { ...clean(created.toJSON()), activeDeliveries: 0 } });
  } catch (error) {
    next(error);
  }
};

const loadOwnedDeliveryMan = async (req) => {
  const doc = await DeliveryMan.findOne({ id: req.params.id, vendorId: String(req.user._id) }).lean();
  return doc || null;
};

/**
 * @desc    Edit a saved delivery person (or switch them on / off duty)
 * @route   PUT/PATCH /api/vendor/delivery-men/:id
 * @access  Private (vendor, owner only)
 */
export const updateDeliveryMan = async (req, res, next) => {
  try {
    const vendorId = String(req.user._id);
    const existing = await loadOwnedDeliveryMan(req);
    if (!existing) return fail(res, 404, 'Delivery person not found');
    const { fields, error } = parseDeliveryMan(req.body, existing);
    if (error) return fail(res, 400, error);
    if (fields.phone !== existing.phone && (await DeliveryMan.exists({ vendorId, phone: fields.phone, id: { $ne: existing.id } }))) {
      return fail(res, 409, 'A delivery person with this mobile number is already saved');
    }
    const saved = await DeliveryMan.findOneAndUpdate({ id: existing.id, vendorId }, { $set: fields }, { new: true }).lean();
    res.json({ success: true, data: clean(saved) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a saved delivery person (not while they are carrying an order)
 * @route   DELETE /api/vendor/delivery-men/:id
 * @access  Private (vendor, owner only)
 */
export const deleteDeliveryMan = async (req, res, next) => {
  try {
    const vendorId = String(req.user._id);
    const existing = await loadOwnedDeliveryMan(req);
    if (!existing) return res.json({ success: true, deleted: 0 });
    const counts = await activeDeliveryCounts(vendorId, [existing.id]);
    if (counts.get(existing.id)) {
      return fail(res, 409, `${existing.name} is still delivering ${counts.get(existing.id)} order(s). You can switch them off duty instead.`);
    }
    const result = await DeliveryMan.deleteOne({ id: existing.id, vendorId });
    res.json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    next(error);
  }
};

/**
 * Who is delivering: a saved delivery person (checked to belong to this vendor and be on
 * duty) or details typed in by hand. Returns { rider } or { error: [status, message] }.
 */
const resolveRider = async (vendorId, body = {}) => {
  if (body.deliveryManId) {
    const man = await DeliveryMan.findOne({ id: String(body.deliveryManId), vendorId }).lean();
    if (!man) return { error: [400, 'That delivery person is not in your team'] };
    if (man.active === false) return { error: [400, `${man.name} is marked off duty`] };
    return { rider: { name: man.name, phone: man.phone, vehicleNumber: man.vehicleNumber, deliveryManId: man.id } };
  }
  return { rider: { name: body.driverName, phone: body.driverPhone, vehicleNumber: body.vehicleNumber } };
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
      ['name', 'phone', 'vehicleNumber', 'deliveryManId'].map((k) => [k, String(rider[k] ?? s.rider?.[k] ?? '').trim().slice(0, 60)])
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


/**
 * @desc    Update the fulfilment status of the vendor's own line item within an order
 * @route   PATCH /api/vendor/orders/:orderId/items/:productId/status
 * @access  Private (vendor, owner of that line item only)
 */
export const updateMyOrderItemStatus = async (req, res, next) => {
  try {
    const resolved = await resolveRider(String(req.user._id), req.body);
    if (resolved.error) return fail(res, resolved.error[0], resolved.error[1]);
    const result = await advanceVendorItems({
      orderId: req.params.orderId,
      vendorId: String(req.user._id),
      productId: req.params.productId,
      status: req.body?.status,
      rider: resolved.rider,
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
    const resolved = await resolveRider(String(req.user._id), req.body);
    if (resolved.error) return fail(res, resolved.error[0], resolved.error[1]);
    const result = await advanceVendorItems({
      orderId: req.params.orderId,
      vendorId: String(req.user._id),
      status: req.body?.status,
      rider: resolved.rider,
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
