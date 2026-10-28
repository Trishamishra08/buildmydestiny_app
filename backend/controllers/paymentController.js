import PaymentIntent from '../models/PaymentIntent.js';
import { priceCart } from '../utils/orderPricing.js';
import { resolveDelivery, orderAddress } from '../utils/deliveryZones.js';
import { isConfigured, publicKey, sandboxAllowed, createGatewayOrder, confirmPayment } from '../utils/razorpay.js';

if (!isConfigured()) {
  console.warn('⚠️ RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set - online payments will be rejected.');
}

/**
 * @desc Get public Razorpay Key
 * @route GET /api/payments/key
 */
export const getRazorpayKey = async (req, res) => {
  res.json({ success: true, key: publicKey() });
};

/**
 * @desc  Start an online payment. The cart is priced on the server and Razorpay is asked
 *        to collect exactly that amount; the browser never chooses the amount.
 * @route POST /api/payments/create-order  { items, couponCode }
 * @access Private (signed-in shopper)
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { items, couponCode, includeUnloading, isUnloadingSelected } = req.body || {};
    const { lines, totals, couponCode: appliedCode } = await priceCart({
      items,
      couponCode,
      includeUnloading: Boolean(includeUnloading ?? isUnloadingSelected ?? false),
    });
    // Don't take money for an address the vendors can't deliver to.
    await resolveDelivery({
      address: orderAddress(req.body),
      productIds: lines.map((l) => l.product?.id).filter(Boolean),
    });
    if (totals.grandTotal <= 0) {
      return res.status(400).json({ success: false, message: 'Nothing to pay for this order' });
    }

    const receipt = `rcpt_${Date.now().toString().slice(-8)}`;
    let gatewayOrder;

    if (isConfigured()) {
      try {
        gatewayOrder = await createGatewayOrder({
          amountRupees: totals.grandTotal,
          receipt,
          notes: { userId: String(req.user._id), store: 'Mistri' },
        });
      } catch (err) {
        if (!sandboxAllowed()) {
          return res.status(502).json({ success: false, message: `Payment gateway error: ${err.message}` });
        }
      }
    } else if (!sandboxAllowed()) {
      return res.status(500).json({ success: false, message: 'Payment gateway is not configured on this server' });
    }

    // Development only: a local order id the sandbox checkout can use.
    if (!gatewayOrder) {
      gatewayOrder = {
        id: `order_local_${Date.now()}`,
        amount: Math.round(totals.grandTotal * 100),
        currency: 'INR',
        receipt,
        status: 'created',
      };
    }

    await PaymentIntent.create({
      id: gatewayOrder.id,
      userId: String(req.user._id),
      amount: totals.grandTotal,
      amountPaise: Number(gatewayOrder.amount),
      lines,
      totals,
      couponCode: appliedCode,
    });

    res.json({
      success: true,
      order: { id: gatewayOrder.id, amount: gatewayOrder.amount, currency: gatewayOrder.currency },
      key: publicKey(),
      pricing: totals,
      sandbox: gatewayOrder.id.startsWith('order_local_'),
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

/**
 * @desc  Check a completed checkout payment against what the server asked to collect.
 *        Placing the order (POST /api/orders) runs the same check; this endpoint lets a
 *        client confirm a payment on its own.
 * @route POST /api/payments/verify  { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * @access Private (signed-in shopper)
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, verified: false, message: 'Missing payment details' });
    }

    const intent = await PaymentIntent.findOne({ id: razorpay_order_id }).lean();
    if (!intent || (req.user.role !== 'admin' && intent.userId !== String(req.user._id))) {
      return res.status(404).json({ success: false, verified: false, message: 'Unknown payment order' });
    }

    const result = await confirmPayment({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      expectedAmountPaise: intent.amountPaise,
    });

    if (!result.ok) {
      return res.status(400).json({ success: false, verified: false, message: result.reason });
    }
    res.json({
      success: true,
      verified: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    res.status(500).json({ success: false, verified: false, message: error.message });
  }
};
