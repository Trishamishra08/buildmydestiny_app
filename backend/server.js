import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import mistriRoutes from './routes/mistriRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import categorySectionRoutes from './routes/categorySectionRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import {
  couponRoutes,
  settingsRoutes,
  bannerRoutes,
  faqRoutes,
  cityRoutes,
  quotationRoutes,
  supportMessageRoutes,
} from './routes/contentRoutes.js';

// Import Middlewares
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
// The API authenticates with Bearer tokens rather than cookies, so a wildcard
// origin is fine - but it cannot be combined with credentials, which browsers
// reject. Set CLIENT_URL (comma separated) to restrict origins instead.
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Local Vite dev servers stay allowed so a configured CLIENT_URL never breaks development.
const devOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://buildmydestinyapp-frontend.vercel.app',
];

app.use(
  cors({
    origin: allowedOrigins.length ? [...allowedOrigins, ...devOrigins] : '*',
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Root / Health Route
app.get(['/', '/api'], (req, res) => {
  res.json({
    status: 'online',
    app: 'Mistri Construction & Technician Booking API',
    architecture: 'MVC (Model-View-Controller)',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      categorySections: '/api/category-sections',
      orders: '/api/orders',
      services: '/api/services',
      mistris: '/api/mistris',
      bookings: '/api/bookings',
      coupons: '/api/coupons',
      quotations: '/api/quotations',
      banners: '/api/banners',
      faqs: '/api/faqs',
      cities: '/api/cities',
      settings: '/api/settings',
      supportMessages: '/api/support-messages',
      admin: '/api/admin',
      payments: '/api/payments',
      upload: '/api/upload',
      vendor: '/api/vendor',
    },
  });
});

// Mount MVC API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/category-sections', categorySectionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/mistris', mistriRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/support-messages', supportMessageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/vendor', vendorRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Mistri Backend Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}`);
});
