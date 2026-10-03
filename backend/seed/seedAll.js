import 'dotenv/config';
import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Category from '../models/Category.js';
import CategorySection from '../models/CategorySection.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import Banner from '../models/Banner.js';
import City from '../models/City.js';
import Faq from '../models/Faq.js';
import Notification from '../models/Notification.js';
import { priceCart } from '../utils/orderPricing.js';
import { orderFieldsForStep } from '../utils/orderFlow.js';
import { SEED_SECTIONS, SEED_CATEGORIES, SEED_PRODUCTS } from './seedDatabase.js';

/**
 * Full marketplace seed: accounts, catalogue, vendor-owned products, coupons, banners and
 * sample orders at every stage of the fulfilment flow.
 *
 *   npm run seed
 *
 * Safe to re-run: every record is upserted by its key, and records created by vendors,
 * admins or customers through the apps are left alone. Pass --reset to also clear the
 * sample orders before re-creating them.
 *
 * Default panel login (OTP is always 123456):
 *   Vendor  phone 9876543210   (Destiny Build Supplies)
 *   Admin   phone 9876543210
 */

const DEFAULT_PHONE = '9876543210';

const VENDORS = [
  {
    key: 'v1',
    name: 'Harsh Vardhan',
    businessName: 'Destiny Build Supplies',
    phone: `+91 ${DEFAULT_PHONE}`,
    email: 'vendor@buildmydestiny.com',
    city: 'Indore',
    gstin: '23AAAAA0000A1Z5',
    vendorStatus: 'approved',
    categories: ['cement', 'bricks', 'sand', 'blocks'],
  },
  {
    key: 'v2',
    name: 'Rakesh Sharma',
    businessName: 'Sharma Steel & Plumbing Depot',
    phone: '+91 98765 00002',
    email: 'sharma.steel@buildmydestiny.com',
    city: 'Bhopal',
    gstin: '23BBBBB1111B1Z6',
    vendorStatus: 'approved',
    categories: ['steel', 'plumbing', 'adhesives'],
  },
  {
    key: 'v3',
    name: 'Imran Qureshi',
    businessName: 'Royal Tiles & Electricals',
    phone: '+91 98765 00003',
    email: 'royal.tiles@buildmydestiny.com',
    city: 'Ujjain',
    gstin: '23CCCCC2222C1Z7',
    vendorStatus: 'approved',
    categories: ['tiles', 'electrical', 'painting'],
  },
  {
    key: 'v4',
    name: 'Neha Verma',
    businessName: 'New Horizon Traders',
    phone: '+91 98765 00004',
    email: 'new.horizon@buildmydestiny.com',
    city: 'Dewas',
    gstin: '',
    vendorStatus: 'pending', // shows up in the admin panel waiting for approval
    categories: [],
  },
];

// Extra catalogue so every vendor has a healthy range. Images reuse the bundled assets.
const EXTRA_PRODUCTS = [
  { id: 'prod-acc-cement', name: 'ACC Gold Water Shield Cement', subtitle: '(OPC 53 Grade, 50 kg)', brand: 'ACC', categorySlug: 'cement', price: 355, mrp: 420, stockCount: 600, unit: 'bag', moq: 10, image: '/images/categories/cat_cement.png', description: 'ACC Gold Water Shield OPC 53 Grade with hydrophobic additives for long-lasting, leak-resistant construction.' },
  { id: 'prod-shree-cement', name: 'Shree Jung Rodhak Cement', subtitle: '(PPC, 50 kg)', brand: 'Shree', categorySlug: 'cement', price: 350, mrp: 410, stockCount: 520, unit: 'bag', moq: 10, image: '/images/products/prod_ultratech.png', description: 'Shree Jung Rodhak PPC with high resistance to rust and chemical attack, ideal for RCC slabs and columns.' },
  { id: 'prod-m-sand', name: 'Manufactured Sand (M-Sand)', subtitle: '(Per Tonne)', brand: 'Local Depot', categorySlug: 'sand', price: 950, mrp: 1100, stockCount: 400, unit: 'tonne', moq: 5, image: '/images/categories/cat_sand.png', description: 'Zone II graded M-Sand, washed and screened, suited for plastering and concrete mixes.' },
  { id: 'prod-aac-solid', name: 'Solid Concrete Blocks', subtitle: '(8 inch)', brand: 'Local Depot', categorySlug: 'blocks', price: 46, mrp: 58, stockCount: 3000, unit: 'piece', moq: 100, image: '/images/categories/cat_blocks.png', description: 'High-density solid concrete blocks for load-bearing walls and boundary walls.' },
  { id: 'prod-tata-tiscon-10', name: 'Tata Tiscon 550SD TMT Bars', subtitle: '(10mm, 12 m)', brand: 'Tata Tiscon', categorySlug: 'steel', price: 585, mrp: 640, stockCount: 900, unit: 'piece', moq: 20, image: '/images/categories/cat_steel.png', description: 'Tata Tiscon 550SD earthquake-resistant TMT bars with superior bendability and weldability.' },
  { id: 'prod-binding-wire', name: 'Steel Binding Wire', subtitle: '(20 kg Coil)', brand: 'Local Depot', categorySlug: 'steel', price: 1380, mrp: 1600, stockCount: 120, unit: 'coil', moq: 1, image: '/images/categories/cat_steel.png', description: 'Annealed 18 gauge binding wire for rebar tying on site.' },
  { id: 'prod-astral-upvc', name: 'Astral UPVC Drainage Pipe', subtitle: '(4 inch, 3 Meter)', brand: 'Astral', categorySlug: 'plumbing', price: 680, mrp: 820, stockCount: 260, unit: 'pipe', moq: 2, image: '/images/categories/cat_plumbing.png', description: 'Astral UPVC SWR drainage pipe, lead-free and corrosion resistant.' },
  { id: 'prod-somany-tiles', name: 'Somany Ceramic Wall Tiles', subtitle: '(1x2 ft, Box of 8)', brand: 'Somany', categorySlug: 'tiles', price: 890, mrp: 1180, stockCount: 240, unit: 'box', moq: 5, image: '/images/categories/cat_tiles.png', description: 'Glossy digital ceramic wall tiles for bathrooms and kitchens.' },
  { id: 'prod-finolex-wire', name: 'Finolex FR Copper Wire', subtitle: '(4 sq mm, 90 m)', brand: 'Finolex', categorySlug: 'electrical', price: 3450, mrp: 4300, stockCount: 70, unit: 'roll', moq: 1, image: '/images/products/prod_polycab.png', description: 'Finolex flame retardant PVC insulated copper cable for sub-circuits and main lines.' },
  { id: 'prod-berger-paint', name: 'Berger Silk Luxury Emulsion', subtitle: '(10 L)', brand: 'Berger', categorySlug: 'painting', price: 4100, mrp: 5200, stockCount: 60, unit: 'bucket', moq: 1, image: '/images/products/prod_asian_paints.png', description: 'Premium silk finish interior emulsion with stain-resistant technology.' },
];

const COUPONS = [
  { code: 'BUILDMYDESTINY100', description: 'Flat ₹100 Instant Discount on your material orders', discountType: 'flat', flatAmount: 100, discountPercentage: 0, minOrderValue: 999, maxDiscount: 100, badge: 'FIRST ORDER', isActive: true, usageCount: 0 },
  { code: 'BUILDER10', description: '10% Contractor Discount on structural materials & tools', discountType: 'percentage', discountPercentage: 10, flatAmount: 0, minOrderValue: 2500, maxDiscount: 1000, badge: 'TRENDING', isActive: true, usageCount: 0 },
  { code: 'BULK500', description: 'Flat ₹500 Mega Savings on cement bags & steel rebar orders', discountType: 'flat', flatAmount: 500, discountPercentage: 0, minOrderValue: 10000, maxDiscount: 500, badge: 'BEST VALUE', isActive: true, usageCount: 0 },
  { code: 'SITE20', description: '20% Off on electrical cables, switches & plumbing fittings', discountType: 'percentage', discountPercentage: 20, flatAmount: 0, minOrderValue: 1500, maxDiscount: 600, badge: 'SPECIAL', isActive: true, usageCount: 0 },
];

const BANNERS = [
  {
    id: 'hero-banner-main',
    title: "Build Your Dream. We'll Help You Build It Right.",
    subtitle: 'Quality Materials. Trusted Suppliers. Delivered to Your Site.',
    image: '/hero-banner.jpg',
    position: 'hero',
    isActive: true,
    target: 'products',
    showTextOverlay: false,
  },
];

const CITIES = ['Indore', 'Bhopal', 'Ujjain', 'Dewas', 'Dhar', 'Pithampur', 'Gwalior', 'Jabalpur'];

const FAQS = [
  {
    category: 'Delivery',
    questions: [
      { question: 'How fast is delivery to construction sites?', answer: 'Standard materials (cement, steel, sand, bricks) are dispatched within a day of order confirmation across serviceable pin codes.' },
      { question: 'Can I track my order?', answer: 'Yes. Open My Orders and tap Track Order to follow every step from confirmation to delivery.' },
    ],
  },
  {
    category: 'Quality',
    questions: [
      { question: 'Are all materials genuine?', answer: 'Every product is sold by a verified supplier directly from authorised brand depots and includes manufacturer batch certificates.' },
    ],
  },
  {
    category: 'Payments',
    questions: [
      { question: 'Which payment methods are accepted?', answer: 'UPI, cards, net banking and Cash on Delivery are supported.' },
    ],
  },
];

const DEMO_ADDRESS = {
  id: 'addr-demo-1',
  label: 'Current Construction Site',
  recipientName: 'Trisha Mishra',
  phone: '+91 91111 11111',
  street: '123, Scheme No. 78, Vijay Nagar',
  city: 'Indore',
  state: 'Madhya Pradesh',
  pincode: '452010',
  isDefault: true,
};

const upsertUser = async ({ phone, role, ...rest }) => {
  const digits = phone.replace(/\D/g, '').slice(-10);
  const pattern = new RegExp(`${digits.split('').join('\\D*')}$`);
  let user = await User.findOne({ phone: pattern, role });
  if (user) {
    Object.assign(user, rest);
    await user.save();
  } else {
    // Sign-in is by OTP, so the stored password is never used.
    user = await User.create({ phone, role, password: crypto.randomBytes(24).toString('hex'), ...rest });
  }
  return user;
};

const upsertAll = async (Model, records) => {
  const key = Model.appKey || 'id';
  for (const record of records) {
    await Model.updateOne({ [key]: record[key] }, { $set: record }, { upsert: true });
  }
  return records.length;
};

async function seedAccounts() {
  const admin = await upsertUser({
    name: 'BuildMyDestiny Admin',
    phone: `+91 ${DEFAULT_PHONE}`,
    email: 'admin@gmail.com',
    role: 'admin',
    tier: 'Root Administrator (Full Access)',
    status: 'Active',
  });

  const vendors = {};
  for (const { key, categories, ...vendor } of VENDORS) {
    vendors[key] = { doc: await upsertUser({ ...vendor, role: 'vendor', status: 'Active', company: vendor.businessName }), categories };
  }

  const customer = await upsertUser({
    name: 'Trisha Mishra',
    phone: '+91 91111 11111',
    email: 'trisha@example.com',
    role: 'customer',
    city: 'Indore',
    status: 'Active',
    addresses: [DEMO_ADDRESS],
  });

  console.log(`👤 Accounts: admin ${admin.phone}, ${VENDORS.length} vendors, customer ${customer.phone}`);
  return { admin, vendors, customer };
}

async function seedCatalogue(vendors) {
  await upsertAll(CategorySection, SEED_SECTIONS);
  await upsertAll(Category, SEED_CATEGORIES);

  const vendorByCategory = {};
  for (const { doc, categories } of Object.values(vendors)) {
    categories.forEach((slug) => (vendorByCategory[slug] = doc));
  }

  const categoryBySlug = Object.fromEntries(SEED_CATEGORIES.map((c) => [c.slug, c]));
  const extras = EXTRA_PRODUCTS.map((p) => {
    const cat = categoryBySlug[p.categorySlug];
    const pct = Math.round(((p.mrp - p.price) / p.mrp) * 100);
    return {
      category: cat.name,
      section: cat.section,
      discountPercent: pct,
      discount: `${pct}% OFF`,
      isFeatured: false,
      isPopular: true,
      inStock: true,
      rating: 4.6,
      reviewsCount: 120,
      ...p,
    };
  });

  const products = [...SEED_PRODUCTS, ...extras].map((product) => {
    const vendor = vendorByCategory[product.categorySlug];
    return {
      ...product,
      slug: product.slug || product.id.replace(/^prod-/, ''),
      vendorId: vendor ? String(vendor._id) : undefined,
      vendorName: vendor?.businessName,
    };
  });

  await upsertAll(Product, products);
  console.log(`📦 Catalogue: ${SEED_SECTIONS.length} sections, ${SEED_CATEGORIES.length} categories, ${products.length} products`);
  return products;
}

async function seedStorefront() {
  await upsertAll(Coupon, COUPONS);
  await upsertAll(Banner, BANNERS);
  await upsertAll(City, CITIES.map((name) => ({ name })));
  await upsertAll(Faq, FAQS);
  console.log(`🏷️  Storefront: ${COUPONS.length} coupons, ${BANNERS.length} banner, ${CITIES.length} cities, ${FAQS.length} FAQ groups`);
}

// Sample orders at different points in the fulfilment flow. `itemStatus` is what the vendors have
// reported for their items (a line can override it with a third value); the order status is the
// slowest item, exactly as in production.
const SAMPLE_ORDERS = [
  { id: 'MST-100001', daysAgo: 6, method: 'Online (UPI)', items: [['prod-ultratech-cement', 40], ['prod-tata-tiscon-10', 60]], itemStatus: 'Delivered' },
  { id: 'MST-100002', daysAgo: 3, method: 'Cash on Delivery (Pay on Site)', items: [['prod-red-kiln-bricks', 2], ['prod-river-sand-dumper', 1], ['prod-supreme-cpvc-pipe', 6, 'Ready to Ship']], itemStatus: 'Shipped' },
  { id: 'MST-100003', daysAgo: 1, method: 'Online (UPI)', items: [['prod-kajaria-tiles', 20], ['prod-polycab-wire', 3]], itemStatus: 'Ready to Ship' },
  { id: 'MST-100004', daysAgo: 0, method: 'Cash on Delivery (Pay on Site)', items: [['prod-ambuja-cement', 25], ['prod-polycab-wire', 2]], itemStatus: 'Processing' },
  { id: 'MST-100005', daysAgo: 0, method: 'Online (UPI)', items: [['prod-acc-cement', 30], ['prod-m-sand', 5], ['prod-binding-wire', 2]], itemStatus: 'Processing' },
];

const ITEM_STEP = { Processing: 2, 'Ready to Ship': 3, Shipped: 4, 'Out for Delivery': 5, Delivered: 6 };

async function seedOrders(customer, { reset }) {
  if (reset) await Order.deleteMany({ id: /^MST-1000\d\d$/ });

  let created = 0;
  for (const sample of SAMPLE_ORDERS) {
    if (await Order.exists({ id: sample.id })) continue;

    const { lines, totals } = await priceCart({
      items: sample.items.map(([id, quantity]) => ({ product: { id }, quantity })),
    });
    const items = lines.map((line, i) => ({ ...line, vendorStatus: sample.items[i][2] || sample.itemStatus }));
    const placedAt = new Date(Date.now() - sample.daysAgo * 24 * 60 * 60 * 1000 - 60 * 60 * 1000);
    const isOnline = /online|upi/i.test(sample.method);
    const delivered = items.every((l) => l.vendorStatus === 'Delivered');
    const paid = isOnline || delivered;
    const paymentStatus = isOnline ? 'Paid (Sandbox)' : paid ? 'Paid (Cash Collected)' : 'Pending (Pay on Site)';
    const flow = orderFieldsForStep(Math.min(...items.map((l) => ITEM_STEP[l.vendorStatus])), { driverName: 'Suresh Gurjar', driverPhone: '+91 97555 43210', vehicleNumber: 'MP 09 GH 4512', liveEtaMinutes: 120 });

    await Order.create({
      id: sample.id,
      orderNumber: sample.id,
      userId: String(customer._id),
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      createdAt: placedAt.toISOString(),
      date: placedAt.toISOString().split('T')[0],
      items,
      itemCount: items.reduce((acc, l) => acc + l.quantity, 0),
      grandTotal: totals.grandTotal,
      total: totals.grandTotal,
      summary: {
        subtotal: totals.subtotal,
        bulkDiscount: totals.discount,
        unloadingCharge: totals.unloadingCharge,
        gstAmount: totals.gstAmount,
        deliveryCharge: totals.deliveryFee,
        deliveryNote: totals.deliveryNote,
        isGstInclusive: totals.isGstInclusive,
        deliveryType: totals.deliveryType,
        totalAmount: totals.grandTotal,
      },
      siteAddress: DEMO_ADDRESS,
      shippingAddress: DEMO_ADDRESS,
      paymentMethod: sample.method,
      paymentStatus,
      payment: { method: sample.method, status: paymentStatus, gateway: isOnline ? 'Razorpay Sandbox (not verified)' : 'Cash On Site', transactionId: `TXN-${sample.id}` },
      ...flow,
    });
    created += 1;

    await Notification.updateOne(
      { id: `anot_order_${sample.id}` },
      {
        $setOnInsert: {
          id: `anot_order_${sample.id}`,
          type: 'new_order',
          title: `New ${isOnline ? 'Online' : 'Cash'} Order #${sample.id}`,
          message: `${customer.name} placed an order for ₹${totals.grandTotal.toLocaleString('en-IN')} (${sample.method})`,
          orderId: sample.id,
          amount: totals.grandTotal,
          unread: sample.daysAgo === 0,
          createdAt: placedAt.toISOString(),
        },
      },
      { upsert: true }
    );
  }
  console.log(`🧾 Orders: ${created} new sample orders (${SAMPLE_ORDERS.length - created} already present)`);
}

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing - copy backend/.env.example to backend/.env first.');
    process.exit(1);
  }
  const reset = process.argv.includes('--reset');

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`✅ Connected to ${mongoose.connection.name}`);

  // Create collections + indexes up front so the unique keys are enforced from the start.
  for (const model of Object.values(mongoose.models)) await model.syncIndexes().catch(() => {});

  const { vendors, customer } = await seedAccounts();
  await seedCatalogue(vendors);
  await seedStorefront();
  await seedOrders(customer, { reset });

  console.log('\n🎉 Seed complete.');
  console.log(`   Vendor panel  /vendor  → phone ${DEFAULT_PHONE}, OTP 123456`);
  console.log(`   Admin panel   /admin   → phone ${DEFAULT_PHONE}, OTP 123456`);
  console.log('   Customer app  /        → any 10-digit phone, OTP 123456 (demo: 9111111111)');
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('❌ Seed failed:', error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
