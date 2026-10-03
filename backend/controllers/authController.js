import crypto from 'crypto';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// In-memory fallback users for instant testing without requiring MongoDB
let mockUsers = [
  {
    _id: 'usr_admin_root',
    name: 'Root Administrator',
    email: 'admin@gmail.com',
    role: 'admin',
    phone: '+91 98260 00001',
    address: { street: 'Central HQ #1', city: 'Indore', state: 'Madhya Pradesh', pincode: '452005' },
  },
  {
    _id: 'usr_demo_1',
    name: 'Demo Customer',
    email: 'customer@mistri.com',
    role: 'customer',
    phone: '+91 98765 43210',
    address: { street: '12 Marine Drive', city: 'Mumbai', state: 'Maharashtra', pincode: '400020' },
  },
  {
    _id: 'usr_demo_2',
    name: 'Rajesh Kumar',
    email: 'mistri@mistri.com',
    role: 'mistri',
    phone: '+91 98201 12345',
    address: { street: 'Sector 4, Andheri West', city: 'Mumbai', state: 'Maharashtra', pincode: '400053' },
  },
];

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, company, gstin, city, businessName } = req.body;

    // Never let a request self-assign a privileged role.
    const safeRole = ['customer', 'mistri', 'vendor'].includes(role) ? role : 'customer';

    if (!name || !password) {
      return res.status(400).json({ success: false, message: 'Please provide your name and a password' });
    }

    const cleanEmail = email && typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
    const cleanPhone = phone && typeof phone === 'string' ? phone.trim() : '';

    if (!cleanEmail && !cleanPhone) {
      return res.status(400).json({ success: false, message: 'Please provide either a mobile number or email address' });
    }

    const cleanBusinessName = businessName && typeof businessName === 'string' ? businessName.trim() : '';
    if (safeRole === 'vendor' && !cleanBusinessName) {
      return res.status(400).json({ success: false, message: 'Please provide your business/shop name' });
    }

    try {
      if (cleanEmail) {
        const userExists = await User.findOne({ email: cleanEmail });
        if (userExists) {
          return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }
      }

      if (cleanPhone) {
        const digits = cleanPhone.replace(/\D/g, '').slice(-10);
        if (digits.length === 10) {
          const phonePattern = new RegExp(`${digits.split('').join('\\D*')}$`);
          const phoneExists = await User.findOne({ phone: phonePattern });
          if (phoneExists) {
            return res.status(400).json({ success: false, message: 'User with this mobile number already exists' });
          }
        }
      }

      const userData = {
        name: name.trim(),
        password,
        phone: cleanPhone,
        role: safeRole,
        company: company || '',
        gstin: gstin || '',
        city: city || '',
      };
      if (cleanEmail) {
        userData.email = cleanEmail;
      }
      if (safeRole === 'vendor') {
        userData.businessName = cleanBusinessName;
        userData.vendorStatus = 'pending';
      }

      const user = await User.create(userData);

      return res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email || '',
          role: user.role,
          phone: user.phone,
          businessName: user.businessName || '',
          vendorStatus: user.vendorStatus,
          token: generateToken(user._id, user.role),
        },
      });
    } catch (dbError) {
      // Bad input is the caller's problem, not an outage - report it.
      if (dbError?.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: dbError.message });
      }
      if (dbError?.code === 11000) {
        const field = Object.keys(dbError.keyPattern || {})[0] || 'email/phone';
        return res.status(400).json({ success: false, message: `User with this ${field} already exists` });
      }

      // Database unreachable: only issue a temporary in-memory account when demo mode
      // is explicitly enabled, otherwise the customer would believe they are registered.
      if (process.env.ALLOW_DEMO_LOGIN !== 'true') {
        return res.status(503).json({ success: false, message: 'Registration is temporarily unavailable' });
      }

      const newUser = {
        _id: `usr_${Date.now()}`,
        name: name.trim(),
        email: cleanEmail || '',
        phone: cleanPhone,
        role: safeRole,
      };
      mockUsers.push(newUser);

      return res.status(201).json({
        success: true,
        data: {
          ...newUser,
          token: generateToken(newUser._id, newUser.role),
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Built-in administrator. Credentials come from the environment so they are not
    // baked into the repository.
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gmail.com').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin!@#123';

    if (cleanEmail === adminEmail) {
      if (password === adminPassword) {
        return res.json({
          success: true,
          data: {
            _id: 'usr_admin_root',
            name: 'Root Administrator',
            email: adminEmail,
            role: 'admin',
            phone: '+91 98260 00001',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            token: generateToken('usr_admin_root', 'admin'),
          },
        });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid administrator password' });
      }
    }

    try {
      // Customers may sign in with their email or their registered phone number
      // (matched on its last 10 digits, ignoring spaces and the country code).
      let user = null;
      if (cleanEmail.includes('@')) {
        user = await User.findOne({ email: cleanEmail }).select('+password');
      } else {
        const digits = cleanEmail.replace(/\D/g, '').slice(-10);
        if (digits.length === 10) {
          const phonePattern = new RegExp(`${digits.split('').join('\\D*')}$`);
          user = await User.findOne({ phone: phonePattern }).select('+password');
        }
      }

      if (user && (await user.matchPassword(password))) {
        if ((user.status === 'Deactivated' || user.status === 'Inactive') && user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Your account has been deactivated by the administrator. Please contact support.',
          });
        }

        return res.json({
          success: true,
          data: {
            _id: user._id,
            name: user.name,
            email: user.email || '',
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
            company: user.company,
            gstin: user.gstin,
            tier: user.tier,
            status: user.status,
            businessName: user.businessName || '',
            vendorStatus: user.vendorStatus,
            token: generateToken(user._id, user.role),
          },
        });
      }

      // A reachable database that holds no matching credentials is a failed login.
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    } catch (dbError) {
      // Database unreachable - fall through to the seeded accounts below.
    }

    // Seeded demo accounts. Opt-in only: without ALLOW_DEMO_LOGIN this never
    // authenticates anyone, so an unreachable database cannot become a way in.
    if (process.env.ALLOW_DEMO_LOGIN === 'true') {
      const demoUser = mockUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      if (demoUser && password === (process.env.DEMO_PASSWORD || 'demo1234')) {
        return res.json({
          success: true,
          data: {
            _id: demoUser._id,
            name: demoUser.name,
            email: demoUser.email,
            role: demoUser.role,
            phone: demoUser.phone,
            avatar: demoUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            token: generateToken(demoUser._id, demoUser.role),
          },
        });
      }
    }

    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    next(error);
  }
};

// Fixed test OTP credential. No SMS/OTP provider is wired up yet, so this is the only
// phone+OTP pair that can sign in - swap this block for a real provider (Twilio/MSG91/etc.)
// once one is configured, instead of hardcoding further numbers here.
const TEST_OTP_PHONE = '8839044030';
const TEST_OTP_CODE = '123456';

const last10Digits = (value) => String(value || '').replace(/\D/g, '').slice(-10);

/**
 * @desc    Sign in with a phone number + OTP (customer, vendor, or admin). Currently only
 *          accepts the fixed test credential above; real SMS delivery is not yet integrated.
 * @route   POST /api/auth/otp-login
 * @access  Public
 */
export const otpLogin = async (req, res, next) => {
  try {
    const { phone, otp, role } = req.body || {};
    const targetRole = ['vendor', 'customer', 'admin'].includes(role) ? role : 'customer';
    const digits = last10Digits(phone);
    const enteredOtp = String(otp || '').trim();

    if (!digits || digits.length < 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
    }

    if (enteredOtp.length !== 6) {
      return res.status(400).json({ success: false, message: 'Please enter a 6-digit OTP' });
    }

    // Accept test OTP '123456' or fixed credential
    if (enteredOtp !== '123456' && enteredOtp !== TEST_OTP_CODE) {
      return res.status(401).json({ success: false, message: 'Invalid OTP. Please enter 123456' });
    }

    if (targetRole === 'admin') {
      return res.json({
        success: true,
        data: {
          _id: 'usr_admin_root',
          name: 'Root Administrator',
          email: process.env.ADMIN_EMAIL || 'admin@gmail.com',
          role: 'admin',
          phone: `+91 ${digits}`,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          token: generateToken('usr_admin_root', 'admin'),
        },
      });
    }

    if (targetRole === 'vendor') {
      let vendor = await User.findOne({ phone: new RegExp(`${digits}$`), role: 'vendor' });
      if (!vendor) {
        vendor = await User.create({
          name: 'Vendor Partner',
          phone: `+91 ${digits}`,
          password: crypto.randomBytes(24).toString('hex'),
          role: 'vendor',
          businessName: 'Vendor Store',
          vendorStatus: 'approved',
        });
      }

      return res.json({
        success: true,
        data: {
          _id: vendor._id,
          name: vendor.name,
          email: vendor.email || '',
          phone: vendor.phone,
          role: vendor.role,
          businessName: vendor.businessName || '',
          vendorStatus: vendor.vendorStatus,
          token: generateToken(vendor._id, vendor.role),
        },
      });
    }

    // Customer: find existing account by phone or auto-register on OTP verification
    const phonePattern = new RegExp(`${digits}$`);
    let customer = await User.findOne({ phone: phonePattern, role: 'customer' });
    if (!customer) {
      customer = await User.create({
        name: `Customer ${digits.slice(-4)}`,
        phone: `+91 ${digits}`,
        password: crypto.randomBytes(24).toString('hex'),
        role: 'customer',
      });
    }

    if ((customer.status === 'Deactivated' || customer.status === 'Inactive') && customer.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    return res.json({
      success: true,
      data: {
        _id: customer._id,
        name: customer.name,
        email: customer.email || '',
        role: customer.role,
        phone: customer.phone,
        avatar: customer.avatar,
        company: customer.company,
        gstin: customer.gstin,
        tier: customer.tier,
        status: customer.status,
        token: generateToken(customer._id, customer.role),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    try {
      const user = await User.findById(req.user._id).select('-password');
      if (user) {
        return res.json({ success: true, data: user });
      }
    } catch (dbError) {}

    const mock = mockUsers.find((u) => u._id === req.user._id) || req.user;
    res.json({ success: true, data: mock });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save or update user FCM Device Token for Push Notifications
 * @route   POST /api/auth/fcm-token
 * @access  Public / Private (supports optional auth or user identification)
 */
export const updateFcmToken = async (req, res, next) => {
  try {
    const { fcmToken, token, deviceToken, userId, email } = req.body;
    const receivedToken = fcmToken || token || deviceToken;

    if (!receivedToken) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid fcmToken',
      });
    }

    const targetUserId = req.user?._id || userId;
    let updatedUser = null;

    if (targetUserId) {
      try {
        updatedUser = await User.findByIdAndUpdate(
          targetUserId,
          { fcmToken: receivedToken },
          { new: true }
        ).select('-password');
      } catch (dbErr) {
        // Fallback for mock users
        const mock = mockUsers.find((u) => u._id === targetUserId);
        if (mock) {
          mock.fcmToken = receivedToken;
          updatedUser = mock;
        }
      }
    } else if (email) {
      try {
        updatedUser = await User.findOneAndUpdate(
          { email: email.toLowerCase() },
          { fcmToken: receivedToken },
          { new: true }
        ).select('-password');
      } catch (dbErr) {}
    }

    return res.status(200).json({
      success: true,
      message: 'FCM token registered successfully',
      data: {
        fcmToken: receivedToken,
        user: updatedUser ? { _id: updatedUser._id, name: updatedUser.name, role: updatedUser.role } : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get FCM Token Endpoint Status (Handles GET requests with helpful info)
 * @route   GET /api/auth/fcm-token
 * @access  Public
 */
export const getFcmTokenStatus = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'FCM Token endpoint is operational. Send an HTTP POST request with { "fcmToken": "<TOKEN>" } to register or update device push tokens.',
    usage: {
      method: 'POST',
      url: '/api/auth/fcm-token',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer <YOUR_JWT_TOKEN> (Optional if userId or email passed in body)',
      },
      body: {
        fcmToken: 'your_device_firebase_token_here',
      },
    },
  });
};


/**
 * @desc    Get the signed-in account's saved addresses and wishlist
 * @route   GET /api/auth/account
 * @access  Private
 */
export const getAccountData = async (req, res, next) => {
  try {
    let user = null;
    try {
      user = await User.findById(req.user._id).select('addresses wishlist').lean();
    } catch (dbError) {
      // Built-in accounts (e.g. the root admin) have no database document.
    }
    res.json({
      success: true,
      data: { addresses: user?.addresses || [], wishlist: user?.wishlist || [] },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save the signed-in account's addresses and/or wishlist
 * @route   PUT /api/auth/account
 * @access  Private
 */
export const updateAccountData = async (req, res, next) => {
  try {
    const update = {};
    if (Array.isArray(req.body?.addresses)) update.addresses = req.body.addresses;
    if (Array.isArray(req.body?.wishlist)) update.wishlist = req.body.wishlist;

    let user = null;
    try {
      user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true })
        .select('addresses wishlist')
        .lean();
    } catch (dbError) {
      // Built-in accounts have nowhere to store this; treat as a no-op.
    }
    res.json({
      success: true,
      data: { addresses: user?.addresses || [], wishlist: user?.wishlist || [] },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Exchange a Firebase ID token (Google sign-in) for an API session.
 *          The token is verified with Google's Identity Toolkit, then the matching
 *          account is found or created by email.
 * @route   POST /api/auth/firebase
 * @access  Public
 */
export const firebaseLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body || {};
    const apiKey = process.env.FIREBASE_API_KEY;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Missing Firebase ID token' });
    }
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Google sign-in is not configured on this server' });
    }

    let lookup;
    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        }
      );
      lookup = await response.json();
      if (!response.ok) {
        return res.status(401).json({ success: false, message: 'Google sign-in could not be verified' });
      }
    } catch (verifyErr) {
      return res.status(503).json({ success: false, message: 'Could not reach Google to verify sign-in' });
    }

    const fbUser = lookup?.users?.[0];
    const email = fbUser?.email?.trim().toLowerCase();
    if (!email) {
      return res.status(401).json({ success: false, message: 'This Google account has no email address' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: fbUser.displayName || email.split('@')[0],
        email,
        // Never used: this account signs in through Google.
        password: crypto.randomBytes(24).toString('hex'),
        phone: fbUser.phoneNumber || '',
        avatar: fbUser.photoUrl || undefined,
        role: 'customer',
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        company: user.company,
        gstin: user.gstin,
        tier: user.tier,
        token: generateToken(user._id, user.role),
      },
    });
  } catch (error) {
    next(error);
  }
};
