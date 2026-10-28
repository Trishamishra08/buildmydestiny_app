import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import PaymentIntent from '../models/PaymentIntent.js';
import buildCrud from './crudFactory.js';
import { notifyNewOrder } from './notificationHooks.js';
import { priceCart } from '../utils/orderPricing.js';
import { confirmPayment, sandboxAllowed } from '../utils/razorpay.js';
import { FLOW, buildTracking, orderFieldsForStep, applyStatusToItems, buildShipments, trackingView } from '../utils/orderFlow.js';
import { reserveStock, releaseStock } from '../utils/stock.js';
import { resolveDelivery, orderAddress, etaLabel } from '../utils/deliveryZones.js';

/**
 * Material orders
 * @route /api/orders  - customers create/read their own, admins manage all
 */
const orderCrud = buildCrud(Order, { scopeToOwner: true, onCreate: notifyNewOrder });
export default orderCrud;

const ONLINE_METHOD = /online|upi|card|net ?banking|wallet|razorpay|phonepe|paytm|google pay|gpay/i;

// Presentation details the customer chooses; everything priced or status-related is
// decided on the server.
const CUSTOMER_FIELDS = [
  'customerName',
  'customerPhone',
  'deliverySlot',
  'vehicleAccess',
  'unloadingNotes',
  'siteAddress',
  'shippingAddress',
  'expectedDelivery',
  'deliveryDate',
  'deliveryMessage',
  'isAfter8PMOrder',
  'date',
  'time',
];

const fail = (res, status, message) => res.status(status).json({ success: false, message });

const newOrderId = async () => {
  for (let attempt = 0; attempt < 8; attempt++) {
    const id = `MST-${Math.floor(100000 + Math.random() * 900000)}`;
    if (!(await Order.exists({ id }))) return id;
  }
  return `MST-${Date.now()}`;
};

// Drivers are assigned later by the delivering vendor, never by the customer.
const initialTracking = (etaMinutes) =>
  buildTracking(2, { driverName: '', driverPhone: '', vehicleNumber: '', liveEtaMinutes: etaMinutes });

/**
 * @desc  Place an order. Customers send what they want (products, quantities, variants,
 *        coupon, delivery details); the server prices it from the database. Online
 *        orders must carry a Razorpay payment that the server confirms for exactly the
 *        amount it asked the gateway to collect.
 * @route POST /api/orders
 * @access Private
 */
export const placeOrder = async (req, res) => {
  // Administrators may record orders directly (e.g. taken over the phone).
  if (req.user.role === 'admin') return orderCrud.upsert(req, res);

  const body = req.body || {};
  const payment = body.payment || {};
  const methodLabel = String(body.paymentMethod || payment.method || 'Cash on Delivery');
  const isOnline = ONLINE_METHOD.test(methodLabel) && !/cash/i.test(methodLabel);
  const userId = String(req.user._id);

  let lines;
  let totals;
  let couponCode;
  let paymentStatus;
  let gateway;
  let intentId = null;
  const razorpayOrderId = payment.razorpayOrderId || body.razorpayOrderId || null;
  const razorpayPaymentId = payment.razorpayPaymentId || body.razorpayPaymentId || null;
  const razorpaySignature = payment.razorpaySignature || body.razorpaySignature || null;

  try {
    if (isOnline) {
      if (!razorpayOrderId || !razorpayPaymentId) {
        return fail(res, 400, 'Online orders need a completed payment');
      }

      // Claim the payment first so it can never be used for two orders.
      const intent = await PaymentIntent.findOneAndUpdate(
        { id: razorpayOrderId, userId, status: 'created' },
        { $set: { status: 'used' } },
        { new: true }
      ).lean();
      if (!intent) {
        const existing = await PaymentIntent.findOne({ id: razorpayOrderId }).lean();
        if (existing?.status === 'used') return fail(res, 409, 'This payment has already been used for an order');
        return fail(res, 400, 'This payment was not started from your account');
      }
      intentId = intent.id;

      const isSandbox = intent.id.startsWith('order_local_') || !razorpaySignature;
      if (isSandbox) {
        if (!sandboxAllowed()) {
          await PaymentIntent.updateOne({ id: intentId }, { $set: { status: 'created' } });
          return fail(res, 400, 'Payment could not be verified');
        }
        paymentStatus = 'Paid (Sandbox)';
        gateway = 'Razorpay Sandbox (not verified)';
      } else {
        const result = await confirmPayment({
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
          expectedAmountPaise: intent.amountPaise,
        });
        if (!result.ok) {
          await PaymentIntent.updateOne({ id: intentId }, { $set: { status: 'created' } });
          return fail(res, 400, `Payment could not be verified: ${result.reason}`);
        }
        paymentStatus = 'Paid';
        gateway = 'Razorpay';
      }

      // The order is exactly what was priced and paid for.
      ({ lines, totals, couponCode } = intent);
    } else {
      ({ lines, totals, couponCode } = await priceCart({
        items: body.items,
        couponCode: body.couponCode,
        includeUnloading: Boolean(body.includeUnloading ?? body.isUnloadingSelected ?? false),
      }));
      paymentStatus = 'Pending (Pay on Site)';
      gateway = 'Cash On Site';
    }

    // Delivery is handled by the vendors themselves: the customer's pincode decides the
    // zone (and its delivery promise) and every vendor in the order must serve that zone.
    const delivery = await resolveDelivery({
      address: orderAddress(body),
      productIds: lines.map((l) => l.product?.id).filter(Boolean),
    });

    const id = await newOrderId();
    const now = new Date();
    const promisedBy = new Date(now.getTime() + delivery.etaMinutes * 60000).toISOString();
    const customer = Object.fromEntries(CUSTOMER_FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

    const order = {
      ...customer,
      id,
      orderNumber: id,
      userId,
      customerEmail: req.user.email ? String(req.user.email).toLowerCase() : undefined,
      createdAt: now.toISOString(),
      date: customer.date || now.toISOString().split('T')[0],
      status: 'Confirmed',
      statusCode: 'confirmed',
      items: lines,
      itemCount: lines.reduce((acc, l) => acc + l.quantity, 0),
      couponCode: couponCode || null,
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
      paymentMethod: methodLabel,
      paymentStatus,
      payment: {
        method: methodLabel,
        status: paymentStatus,
        gateway,
        transactionId: razorpayPaymentId || `TXN-MST-${now.getTime()}`,
        ...(isOnline ? { razorpayOrderId, razorpayPaymentId } : {}),
      },
      ...(isOnline ? { razorpayPaymentId } : {}),
      tracking: initialTracking(delivery.etaMinutes),
      deliveryManagedBy: 'vendor',
      deliveryZone: delivery.zone ? { id: delivery.zone.id, name: delivery.zone.name, city: delivery.zone.city } : null,
      etaMinutes: delivery.etaMinutes,
      promisedBy,
      expectedDelivery: `Within ${etaLabel(delivery.etaMinutes)}`,
      deliveryMessage: `Delivered by the vendor within ${etaLabel(delivery.etaMinutes)}`,
      shipments: buildShipments(lines, { etaMinutes: delivery.etaMinutes, promisedBy }),
    };

    let saved;
    try {
      saved = (await Order.create(order)).toJSON();
    } catch (err) {
      if (intentId) await PaymentIntent.updateOne({ id: intentId }, { $set: { status: 'created' } });
      if (err?.code === 11000) return fail(res, 409, 'This payment has already been used for an order');
      throw err;
    }

    await reserveStock(saved.items).catch((err) => console.warn('Stock update failed:', err.message));
    if (intentId) await PaymentIntent.updateOne({ id: intentId }, { $set: { orderId: id } });
    if (couponCode) {
      // Count the redemption (skipped if an admin stored usageCount as text).
      await Coupon.updateOne(
        { code: couponCode, usageCount: { $not: { $type: 'string' } } },
        { $inc: { usageCount: 1 } }
      ).catch(() => {});
    }
    notifyNewOrder(saved).catch((err) => console.warn('Order notification failed:', err.message));

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    if (intentId) {
      await PaymentIntent.updateOne({ id: intentId }, { $set: { status: 'created' } }).catch(() => {});
    }
    fail(res, error.status || 500, error.message);
  }
};

/**
 * @desc  Admin update of an order. The admin panel sends back the whole order it holds, which may
 *        be stale - vendors move their own line items meanwhile - so line items are never taken
 *        from the request. A changed order status / tracking step is carried down to the line
 *        items, so vendors and customers see the same progress.
 * @route PATCH /api/orders/:key
 * @access Admin
 */
export const patchOrder = async (req, res) => {
  try {
    const existing = await Order.findOne({ id: req.params.key }).lean();
    if (!existing) return fail(res, 404, 'Record not found');

    const { _id, __v, id: _id2, items: _items, ...fields } = req.body || {};

    const trackingStepChanged =
      fields.tracking?.currentStep !== undefined && Number(fields.tracking.currentStep) !== Number(existing.tracking?.currentStep);
    const statusChanged = fields.status !== undefined && fields.status !== existing.status;
    const flowEntry = FLOW.find((f) => f.status === fields.status);

    let step = null;
    if (trackingStepChanged) step = Number(fields.tracking.currentStep);
    else if (statusChanged && flowEntry) step = flowEntry.step;

    const update = { ...fields };
    if (step) {
      Object.assign(update, orderFieldsForStep(step, { ...(existing.tracking || {}), ...(fields.tracking || {}) }));
      const flow = FLOW[Math.min(Math.max(step, 1), FLOW.length) - 1];
      update.items = applyStatusToItems(existing.items, flow.status);
      if (flow.step === FLOW.length && /cash|pay on site|pending/i.test(String(existing.paymentStatus || ''))) {
        update.paymentStatus = 'Paid (Cash Collected)';
        update.payment = { ...(existing.payment || {}), status: 'Paid (Cash Collected)' };
      }
    } else if (statusChanged && /cancel/i.test(String(fields.status))) {
      update.statusCode = 'cancelled';
    }
    // A cancelled order frees its stock again (once).
    const nowCancelled = /cancel/i.test(String(fields.status || ''));
    if (nowCancelled && !/cancel/i.test(String(existing.status || ''))) {
      await releaseStock(existing.items).catch((err) => console.warn('Stock release failed:', err.message));
    }

    const saved = await Order.findOneAndUpdate({ id: req.params.key }, { $set: update }, { new: true }).lean();
    const { _id: _drop, ...clean } = saved;
    res.json({ success: true, data: clean });
  } catch (error) {
    fail(res, error.status || 500, error.message);
  }
};

/**
 * @desc  Live delivery tracking for one order: per-vendor status, rider details and the
 *        time left against the zone's delivery promise.
 * @route GET /api/orders/:key/track
 * @access Private (owner or admin)
 */
export const trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.key }).lean();
    const isAdmin = req.user.role === 'admin';
    const owns =
      order &&
      (String(order.userId) === String(req.user._id) ||
        (req.user.email && String(order.customerEmail) === String(req.user.email).toLowerCase()));
    if (!order || (!isAdmin && !owns)) return fail(res, 404, 'Record not found');
    res.json({ success: true, data: trackingView(order) });
  } catch (error) {
    fail(res, error.status || 500, error.message);
  }
};
