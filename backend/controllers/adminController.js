import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Quotation from '../models/Quotation.js';
import Mistri from '../models/Mistri.js';
import City from '../models/City.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import Banner from '../models/Banner.js';
import Faq from '../models/Faq.js';
import SupportMessage from '../models/SupportMessage.js';
import Notification from '../models/Notification.js';
import Setting from '../models/Setting.js';
import buildCrud from './crudFactory.js';
import { notifyNewQuotation, notifyNewSupportMessage } from './notificationHooks.js';

// ---------------------------------------------------------------------------
// Collection handlers
// ---------------------------------------------------------------------------

export const couponCrud = buildCrud(Coupon);
export const bannerCrud = buildCrud(Banner);
export const faqCrud = buildCrud(Faq, { sort: { _id: 1 } });
export const cityCrud = buildCrud(City, { sort: { _id: 1 } });
export const notificationCrud = buildCrud(Notification);
export const supportMessageCrud = buildCrud(SupportMessage, { onCreate: notifyNewSupportMessage });
// Anyone (including guests) may submit a quotation inquiry; only admins list/manage them.
export const quotationCrud = buildCrud(Quotation, { onCreate: notifyNewQuotation });

/**
 * @desc Coupons. Shoppers need active coupons to apply them at checkout; the admin
 *       panel sees every coupon.
 * @route GET /api/coupons
 */
export const listCoupons = async (req, res) => {
  if (req.user?.role === 'admin') return couponCrud.list(req, res);
  try {
    const docs = await Coupon.find({ isActive: { $ne: false } }).sort({ _id: -1 }).lean();
    res.json({
      success: true,
      count: docs.length,
      data: docs.map(({ _id, ...rest }) => rest),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// Platform settings (single document)
// ---------------------------------------------------------------------------

const SETTINGS_KEY = 'site';

/**
 * @desc Get platform settings. Empty until an administrator saves them, in which case
 *       the storefront keeps its built-in defaults.
 * @route GET /api/settings
 */
export const getSettings = async (req, res) => {
  try {
    const doc = await Setting.findOne({ key: SETTINGS_KEY }).lean();
    const { _id, key, ...settings } = doc || {};
    res.json({ success: true, data: doc ? settings : null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Replace platform settings (admin)
 * @route PUT /api/settings
 */
export const updateSettings = async (req, res) => {
  try {
    const { _id, key, ...settings } = req.body || {};
    await Setting.replaceOne({ key: SETTINGS_KEY }, { key: SETTINGS_KEY, ...settings }, { upsert: true });
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// Registered users (read-only directory for the admin panel)
// ---------------------------------------------------------------------------

const capitalize = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);

const findUserById = async (id) => {
  if (!id) return null;
  let user = await User.findOne({ clientId: id });
  if (!user && mongoose.Types.ObjectId.isValid(id)) {
    user = await User.findById(id);
  }
  return user;
};

/**
 * @desc List registered accounts in the shape the admin Users table expects
 * @route GET /api/admin/users
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ _id: -1 }).lean();
    const data = users.map((u) => ({
      id: u.clientId || String(u._id),
      _id: String(u._id),
      name: u.name,
      email: u.email || '',
      phone: u.phone || '',
      role: capitalize(u.role),
      company: u.company || '',
      gstin: u.gstin || '',
      city: u.city || u.address?.city || '',
      tier: u.tier || 'Standard Builder Tier',
      status: u.status || 'Active',
      totalOrders: u.totalOrders || 0,
      totalSpend: u.totalSpend || 0,
      createdAt: u.createdAt,
    }));
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Create user account from admin panel
 * @route POST /api/admin/users
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, company, gstin, city, tier, status, id } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide user name' });
    }

    const cleanEmail = email && typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : undefined;
    const cleanPhone = phone && typeof phone === 'string' ? phone.trim() : '';

    if (cleanEmail) {
      const exists = await User.findOne({ email: cleanEmail });
      if (exists) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }
    }

    const userData = {
      name: name.trim(),
      password: password || 'Mistri@123',
      phone: cleanPhone,
      role: (role || 'customer').toLowerCase(),
      company: company || '',
      gstin: gstin || '',
      city: city || '',
      tier: tier || 'Standard Builder Tier',
      status: status || 'Active',
      clientId: id || `usr_${Date.now()}`,
    };
    if (cleanEmail) userData.email = cleanEmail;

    const user = await User.create(userData);
    res.status(201).json({
      success: true,
      data: {
        id: user.clientId || String(user._id),
        _id: String(user._id),
        name: user.name,
        email: user.email || '',
        phone: user.phone || '',
        role: capitalize(user.role),
        company: user.company || '',
        gstin: user.gstin || '',
        city: user.city || '',
        tier: user.tier,
        status: user.status,
        totalOrders: user.totalOrders || 0,
        totalSpend: user.totalSpend || 0,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update user account details or status
 * @route PUT /api/admin/users/:id
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, company, gstin, city, tier, status, password } = req.body;

    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) {
      const cleanEmail = email && typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : undefined;
      if (cleanEmail && cleanEmail !== user.email) {
        const emailExists = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
        if (emailExists) {
          return res.status(400).json({ success: false, message: 'Email is already in use by another account' });
        }
      }
      user.email = cleanEmail;
    }
    if (phone !== undefined) user.phone = phone.trim();
    if (role !== undefined) user.role = role.toLowerCase();
    if (company !== undefined) user.company = company;
    if (gstin !== undefined) user.gstin = gstin;
    if (city !== undefined) user.city = city;
    if (tier !== undefined) user.tier = tier;
    if (status !== undefined) user.status = status;
    if (password && password.trim()) {
      user.password = password.trim();
    }

    await user.save();

    res.json({
      success: true,
      data: {
        id: user.clientId || String(user._id),
        _id: String(user._id),
        name: user.name,
        email: user.email || '',
        phone: user.phone || '',
        role: capitalize(user.role),
        company: user.company || '',
        gstin: user.gstin || '',
        city: user.city || '',
        tier: user.tier,
        status: user.status,
        totalOrders: user.totalOrders || 0,
        totalSpend: user.totalSpend || 0,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Delete user account
 * @route DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin' && (user.email === process.env.ADMIN_EMAIL || user.clientId === 'usr_admin_root')) {
      return res.status(403).json({ success: false, message: 'Cannot delete primary root administrator' });
    }

    await User.findByIdAndDelete(user._id);
    res.json({ success: true, message: 'User account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// Dashboard stats
// ---------------------------------------------------------------------------

/**
 * @desc Get admin dashboard statistics
 * @route GET /api/admin/stats
 */
export const getAdminStats = async (req, res) => {
  try {
    const [revenue, totalOrders, activeProducts, pendingQuotes, activeMistris, registeredContractors, cities] =
      await Promise.all([
        Order.aggregate([
          { $match: { statusCode: { $ne: 'cancelled' } } },
          { $group: { _id: null, total: { $sum: { $ifNull: ['$grandTotal', { $ifNull: ['$total', 0] }] } } } },
        ]),
        Order.countDocuments(),
        Product.countDocuments(),
        Quotation.countDocuments({ status: { $nin: ['Closed', 'Rejected'] } }),
        Mistri.countDocuments({ isAvailable: { $ne: false } }),
        User.countDocuments({ role: { $ne: 'admin' } }),
        City.find().sort({ _id: 1 }).lean(),
      ]);

    res.json({
      success: true,
      data: {
        totalRevenue: revenue[0]?.total || 0,
        totalOrders,
        activeProducts,
        pendingQuotes,
        activeMistris,
        registeredContractors,
        serviceableCities: cities.map((c) => c.name),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
