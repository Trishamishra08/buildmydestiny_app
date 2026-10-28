import { createAppModel, Mixed } from './appModel.js';

// Totals are computed by checkout, so they are strictly typed.
const Order = createAppModel('Order', {
  collection: 'orders',
  fields: {
    orderNumber: Mixed,
    userId: { type: String, index: true },
    customerName: Mixed,
    customerPhone: Mixed,
    customerEmail: { type: String, lowercase: true, trim: true, index: true },
    status: Mixed,
    statusCode: Mixed,
    items: [Mixed],
    itemCount: Number,
    grandTotal: Number,
    total: Number,
    summary: Mixed,
    siteAddress: Mixed,
    shippingAddress: Mixed,
    payment: Mixed,
    paymentMethod: Mixed,
    paymentStatus: Mixed,
    tracking: Mixed,
    couponCode: Mixed,
    deliveryDate: Mixed,
    expectedDelivery: Mixed,
    deliveryMessage: Mixed,
    deliveryManagedBy: Mixed,
    deliveryZone: Mixed,
    etaMinutes: Number,
    promisedBy: Mixed,
    shipments: [Mixed],
    isAfter8PMOrder: Mixed,
    // Set on online orders; unique so one payment can never pay for two orders.
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    createdAt: Mixed,
  },
});

export default Order;
