import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^\S+@\S+\.\S+$/.test(v);
        },
        message: 'Please provide a valid email',
      },
      default: undefined,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['customer', 'mistri', 'vendor', 'admin'],
      default: 'customer',
    },

    // Vendor / seller profile (multivendor marketplace)
    businessName: { type: String, trim: true, default: '' },
    vendorStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    fcmToken: {
      type: String,
      default: '',
    },

    // Id the admin panel generated for accounts it created before they reached the
    // server (e.g. "usr_1726..."). Lets those records keep resolving after sync.
    clientId: { type: String, trim: true, index: true, sparse: true },

    // Contractor / business profile shown in the admin Users list
    company: { type: String, default: '' },
    gstin: { type: String, default: '' },
    city: { type: String, default: '' },
    tier: { type: String, default: 'Standard Builder Tier' },
    status: { type: String, default: 'Active' },
    totalOrders: { type: Number, default: 0 },
    totalSpend: { type: Number, default: 0 },

    // Per-account data that used to live only in one browser's localStorage
    addresses: { type: [mongoose.Schema.Types.Mixed], default: [] },
    wishlist: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
