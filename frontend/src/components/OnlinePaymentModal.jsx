import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  QrCode,
  CreditCard,
  Building2,
  Lock,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Search,
  Check,
  Smartphone,
  RefreshCw,
  Zap,
} from 'lucide-react';
import api from '../services/api';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
// Development only: allows completing an order without a real payment.
const SANDBOX_PAYMENTS = import.meta.env.VITE_ALLOW_SANDBOX_PAYMENTS === 'true';

export const OnlinePaymentModal = ({
  isOpen,
  onClose,
  amount = 535,
  orderItems = [],
  couponCode = null,
  customer = {},
  summary = {},
  onPaymentSuccess,
}) => {
  // Main payment method selection
  const [selectedMethod, setSelectedMethod] = useState('phonepe'); // 'phonepe' | 'gpay' | 'paytm' | 'apps_qr' | 'card' | 'netbanking'
  const [activeSubView, setActiveSubView] = useState(null); // null | 'qr_modal' | 'card_form' | 'bank_selector' | 'breakup' | 'failed_recovery'
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('Connecting to Secure Gateway...');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successTxnId, setSuccessTxnId] = useState('');
  const [failureReason, setFailureReason] = useState('');

  // Countdown timer for page timeout (formatted as MM:SS)
  const [timerSeconds, setTimerSeconds] = useState(53);

  // Card sub-view state
  const [cardData, setCardData] = useState({
    number: '',
    name: customer?.name || 'Er. Rajesh Malviya',
    expiry: '',
    cvv: '',
  });

  // Net banking search & bank selection
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [bankSearch, setBankSearch] = useState('');

  // Price Breakup toggle
  const [isBreakupOpen, setIsBreakupOpen] = useState(false);

  // Timer countdown effect
  useEffect(() => {
    let interval = null;
    if (isOpen && !isSuccess) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isSuccess]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod('phonepe');
      setActiveSubView(null);
      setIsProcessing(false);
      setIsSuccess(false);
      setIsBreakupOpen(false);
      setFailureReason('');
      setTimerSeconds(53);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimeout = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardData((prev) => ({ ...prev, number: formatted }));
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setCardData((prev) => ({ ...prev, expiry: val }));
  };

  const getMethodLabel = (method) => {
    switch (method) {
      case 'phonepe':
        return 'PhonePe UPI';
      case 'gpay':
        return 'Google Pay UPI';
      case 'paytm':
        return 'Paytm UPI';
      case 'apps_qr':
        return 'UPI QR & Apps';
      case 'card':
        return 'Debit/Credit Card';
      case 'netbanking':
        return `Net Banking (${selectedBank})`;
      default:
        return 'Online Payment (Razorpay)';
    }
  };

  // Report a completed payment. The ids come from Razorpay; the server re-checks them
  // with Razorpay before it accepts the order, so nothing here is trusted on its own.
  const triggerSuccessCallback = (paymentDetails) => {
    setIsProcessing(false);
    setIsSuccess(true);
    setSuccessTxnId(paymentDetails.razorpayPaymentId || '');

    setTimeout(() => {
      if (typeof onPaymentSuccess === 'function') {
        onPaymentSuccess({
          transactionId: paymentDetails.razorpayPaymentId,
          paymentMethod: getMethodLabel(selectedMethod),
          gateway: 'Razorpay',
          paidAt: new Date().toISOString(),
          ...paymentDetails,
        });
      }
    }, 1200);
  };

  const showFailure = (reason) => {
    setIsProcessing(false);
    setFailureReason(reason);
    setActiveSubView('failed_recovery');
  };

  // Ask the server to price the cart and open a Razorpay order for exactly that amount.
  const startServerPayment = () =>
    api.createPaymentOrder({
      items: orderItems.map((item) => ({
        product: { id: item.product?.id ?? item.id, variantSelection: item.product?.variantSelection || undefined },
        quantity: item.quantity,
      })),
      couponCode: couponCode || null,
      includeUnloading: Boolean(summary?.isUnloadingSelected),
    });

  // Development only (VITE_ALLOW_SANDBOX_PAYMENTS=true, and the server must allow it too):
  // completes the order without taking a real payment.
  const completeSandboxPayment = async (methodName = null) => {
    if (!SANDBOX_PAYMENTS) {
      showFailure('Online payment is not available right now. Please try again or choose Cash on Delivery.');
      return;
    }
    setIsProcessing(true);
    setProcessingMsg('Authorizing Sandbox Payment...');
    try {
      const { order } = await startServerPayment();
      triggerSuccessCallback({
        razorpayOrderId: order.id,
        razorpayPaymentId: `pay_sandbox_${Date.now()}`,
        gateway: 'Razorpay Sandbox (not verified)',
        paymentMethod: methodName || getMethodLabel(selectedMethod),
      });
    } catch (err) {
      showFailure(err.message || 'Sandbox payment could not be started.');
    }
  };

  // Open Razorpay Checkout for a server-created order. `method` pre-selects card /
  // netbanking / upi inside Razorpay (ignored when called directly from a click).
  const initiateRazorpayCheckout = async (method = null) => {
    const preferredMethod = typeof method === 'string' ? method : null;
    setActiveSubView(null);
    setIsProcessing(true);
    setProcessingMsg('Initializing Razorpay Secure Gateway...');

    let serverPayment;
    try {
      serverPayment = await startServerPayment();
    } catch (err) {
      showFailure(err.message || 'Could not start the payment. Please try again.');
      return;
    }

    if (serverPayment.sandbox) {
      // The server has no working gateway and handed back a local test order.
      completeSandboxPayment();
      return;
    }

    if (typeof window === 'undefined' || !window.Razorpay) {
      showFailure('The payment gateway could not be loaded. Please check your connection and try again.');
      return;
    }

    try {
      const options = {
        key: serverPayment.key || RAZORPAY_KEY_ID,
        amount: serverPayment.order.amount,
        currency: serverPayment.order.currency || 'INR',
        order_id: serverPayment.order.id,
        name: 'BuildMyDestiny',
        description: `Order Payment for ${orderItems.length || 1} items`,
        image: 'https://cdn-icons-png.flaticon.com/512/891/891462.png',
        handler: function (response) {
          triggerSuccessCallback({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
        prefill: {
          name: customer?.name || '',
          email: customer?.email || '',
          contact: customer?.phone || '',
          ...(preferredMethod ? { method: preferredMethod } : {}),
        },
        notes: {
          address: 'Direct site delivery',
          store: 'BuildMyDestiny Online Direct',
        },
        theme: {
          color: '#FFB800',
        },
        modal: {
          ondismiss: function () {
            showFailure('Payment window was dismissed or cancelled.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        showFailure(response.error?.description || 'Transaction declined or failed on gateway.');
      });
      rzp.open();
    } catch (err) {
      showFailure('The payment window could not be opened. Please try again.');
    }
  };

  // Every method is paid through Razorpay Checkout; card details are only ever typed
  // into Razorpay's own secure window.
  const handlePayClick = () => {
    if (selectedMethod === 'netbanking') {
      setActiveSubView('bank_selector');
      return;
    }
    if (selectedMethod === 'card') {
      initiateRazorpayCheckout('card');
      return;
    }
    initiateRazorpayCheckout('upi');
  };

  const popularBanks = [
    { code: 'HDFC', name: 'HDFC Bank', color: '#004c8f' },
    { code: 'SBI', name: 'State Bank of India', color: '#280071' },
    { code: 'ICICI', name: 'ICICI Bank', color: '#b52f20' },
    { code: 'AXIS', name: 'Axis Bank', color: '#97144d' },
    { code: 'KOTAK', name: 'Kotak Mahindra Bank', color: '#e61e24' },
    { code: 'PNB', name: 'Punjab National Bank', color: '#a20f18' },
    { code: 'BOB', name: 'Bank of Baroda', color: '#f26522' },
    { code: 'YES', name: 'Yes Bank', color: '#0054a6' },
  ];

  const filteredBanks = popularBanks.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        animation: 'opmFadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#F8F9FA',
          width: '100%',
          maxWidth: '430px',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh',
          position: 'relative',
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          animation: 'opmSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* TOP BRAND HEADER */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '18px 20px 14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #EEF2F6',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#FFB800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(255, 184, 0, 0.35)',
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11M5 9H19L20 21H4L5 9Z"
                  stroke="#0A0A0A"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontWeight: '800',
                  fontSize: '1.15rem',
                  letterSpacing: '0.8px',
                  color: '#111827',
                  textTransform: 'uppercase',
                }}
              >
                NOYOONLINE
              </div>
            </div>
          </div>

          {!isProcessing && !isSuccess && (
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#F3F4F6',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B7280',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.15s ease',
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* MODAL BODY */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 18px' }}>
          {isSuccess ? (
            /* PAYMENT SUCCESS VIEW */
            <div style={{ textAlign: 'center', padding: '36px 12px' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: '#FFB800',
                  color: '#0A0A0A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  boxShadow: '0 8px 24px rgba(255, 184, 0, 0.35)',
                }}
              >
                <CheckCircle2 size={44} strokeWidth={2.6} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                Payment Authorized!
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '18px', lineHeight: 1.4 }}>
                ₹{Number(amount).toFixed(2)} paid successfully via {getMethodLabel(selectedMethod)}.
              </p>
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  color: '#334155',
                  fontFamily: 'monospace',
                  fontWeight: '600',
                }}
              >
                Ref: {successTxnId || 'TXN-RAZORPAY'}
              </div>
            </div>
          ) : isProcessing ? (
            /* PROCESSING VIEW */
            <div style={{ textAlign: 'center', padding: '44px 12px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  border: '4px solid #E2E8F0',
                  borderTopColor: '#FFB800',
                  borderRadius: '50%',
                  animation: 'opmSpin 0.75s linear infinite',
                  margin: '0 auto 18px auto',
                }}
              />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                Authorizing Payment
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '14px' }}>
                {processingMsg}
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#94A3B8' }}>
                <Lock size={13} />
                <span>256-Bit SSL Secure Razorpay Channel</span>
              </div>
            </div>
          ) : activeSubView === 'failed_recovery' ? (
            /* SMART PAYMENT RECOVERY / RETRY SCREEN */
            <div style={{ padding: '8px 0' }}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '20px 16px',
                  border: '1px solid #E2E8F0',
                  textAlign: 'center',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: '#F2F2F2',
                    color: '#0A0A0A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px auto',
                  }}
                >
                  <AlertCircle size={28} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                  Payment Could Not Be Completed
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '18px', lineHeight: 1.4 }}>
                  {failureReason || 'Your transaction was cancelled or declined by the payment provider.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Instant Sandbox Success Button (development only) */}
                  {SANDBOX_PAYMENTS && (
                  <button
                    type="button"
                    onClick={() => completeSandboxPayment()}
                    style={{
                      width: '100%',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: '#0A0A0A',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: '800',
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    <Zap size={18} />
                    <span>Approve & Complete in Sandbox (Instant)</span>
                  </button>
                  )}

                  {/* Retry Razorpay */}
                  <button
                    type="button"
                    onClick={initiateRazorpayCheckout}
                    style={{
                      width: '100%',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: '#FFB800',
                      color: '#0A0A0A',
                      border: 'none',
                      fontWeight: '800',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <RefreshCw size={16} />
                    <span>Retry with Razorpay Gateway</span>
                  </button>

                  {/* Back to other methods */}
                  <button
                    type="button"
                    onClick={() => setActiveSubView(null)}
                    style={{
                      width: '100%',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: '#F1F5F9',
                      color: '#475569',
                      border: 'none',
                      fontWeight: '700',
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                    }}
                  >
                    Select Another Payment Method
                  </button>
                </div>
              </div>
            </div>
          ) : activeSubView === 'card_form' ? (
            /* SUB-VIEW: CARD FORM */
            <div>
              <button
                type="button"
                onClick={() => setActiveSubView(null)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#0A0A0A',
                  fontWeight: '700',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  padding: '0 0 12px 0',
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to Payment Methods</span>
              </button>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0F172A' }}>
                    Enter Card Details
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: '800', padding: '2px 5px', borderRadius: '4px', backgroundColor: '#EFF6FF', color: '#1D4ED8' }}>VISA</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: '800', padding: '2px 5px', borderRadius: '4px', backgroundColor: '#FFF1F2', color: '#BE123C' }}>MC</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: '800', padding: '2px 5px', borderRadius: '4px', backgroundColor: '#ECFDF5', color: '#047857' }}>RuPay</span>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="4532 •••• •••• 8842"
                    value={cardData.number}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    style={{
                      width: '100%',
                      height: '42px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      padding: '0 12px',
                      fontSize: '0.95rem',
                      letterSpacing: '1px',
                      fontWeight: '600',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardData.expiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                      style={{
                        width: '100%',
                        height: '42px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        padding: '0 12px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                      CVV / CVC
                    </label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                      style={{
                        width: '100%',
                        height: '42px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        padding: '0 12px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name as printed on card"
                    value={cardData.name}
                    onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                    style={{
                      width: '100%',
                      height: '42px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      padding: '0 12px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => initiateRazorpayCheckout('card')}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#FFB800',
                    color: '#0A0A0A',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(255, 184, 0, 0.35)',
                  }}
                >
                  Pay ₹{Number(amount).toFixed(2)} Securely
                </button>
              </div>
            </div>
          ) : activeSubView === 'bank_selector' ? (
            /* SUB-VIEW: NET BANKING SELECTOR */
            <div>
              <button
                type="button"
                onClick={() => setActiveSubView(null)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#0A0A0A',
                  fontWeight: '700',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  padding: '0 0 12px 0',
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to Payment Methods</span>
              </button>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0F172A', marginBottom: '12px' }}>
                  Select Your Bank
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    marginBottom: '14px',
                  }}
                >
                  <Search size={16} color="#64748B" />
                  <input
                    type="text"
                    placeholder="Search 50+ Banks (e.g. HDFC, SBI)..."
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'none',
                      outline: 'none',
                      fontSize: '0.85rem',
                      width: '100%',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  {filteredBanks.map((bank) => (
                    <div
                      key={bank.code}
                      onClick={() => setSelectedBank(bank.code)}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: `1.5px solid ${selectedBank === bank.code ? '#FFB800' : '#E2E8F0'}`,
                        backgroundColor: selectedBank === bank.code ? '#FFF8E1' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ fontWeight: '700', fontSize: '0.84rem', color: '#0F172A' }}>
                        {bank.name}
                      </div>
                      {selectedBank === bank.code && <Check size={16} color="#0A0A0A" strokeWidth={3} />}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => initiateRazorpayCheckout('netbanking')}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#FFB800',
                    color: '#0A0A0A',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(255, 184, 0, 0.35)',
                  }}
                >
                  Proceed with {selectedBank} NetBanking
                </button>
              </div>
            </div>
          ) : activeSubView === 'qr_modal' ? (
            /* SUB-VIEW: UPI QR CODE & VPA */
            <div>
              <button
                type="button"
                onClick={() => setActiveSubView(null)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#0A0A0A',
                  fontWeight: '700',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  padding: '0 0 12px 0',
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to Payment Methods</span>
              </button>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '18px 16px',
                  border: '1px solid #E2E8F0',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ fontWeight: '800', fontSize: '1rem', color: '#0F172A', marginBottom: '4px' }}>
                  Scan UPI QR Code
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '14px' }}>
                  Open any UPI App (GPay, PhonePe, Paytm, BHIM) and scan
                </div>

                <div
                  style={{
                    display: 'inline-block',
                    padding: '12px',
                    borderRadius: '14px',
                    border: '2px solid #0A0A0A',
                    backgroundColor: '#FFFFFF',
                    marginBottom: '12px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <svg width="150" height="150" viewBox="0 0 100 100" style={{ display: 'block' }}>
                    <rect width="100" height="100" fill="#FFFFFF" />
                    <rect x="5" y="5" width="28" height="28" rx="4" fill="#0A0A0A" />
                    <rect x="9" y="9" width="20" height="20" rx="2" fill="#FFFFFF" />
                    <rect x="13" y="13" width="12" height="12" rx="1" fill="#0A0A0A" />

                    <rect x="67" y="5" width="28" height="28" rx="4" fill="#0A0A0A" />
                    <rect x="71" y="9" width="20" height="20" rx="2" fill="#FFFFFF" />
                    <rect x="75" y="13" width="12" height="12" rx="1" fill="#0A0A0A" />

                    <rect x="5" y="67" width="28" height="28" rx="4" fill="#0A0A0A" />
                    <rect x="9" y="71" width="20" height="20" rx="2" fill="#FFFFFF" />
                    <rect x="13" y="75" width="12" height="12" rx="1" fill="#0A0A0A" />

                    <rect x="40" y="8" width="6" height="6" fill="#1E293B" />
                    <rect x="50" y="8" width="6" height="6" fill="#0A0A0A" />
                    <rect x="40" y="20" width="8" height="8" fill="#1E293B" />
                    <rect x="52" y="22" width="6" height="6" fill="#0A0A0A" />
                    <rect x="8" y="40" width="8" height="8" fill="#1E293B" />
                    <rect x="22" y="42" width="6" height="6" fill="#1E293B" />
                    <rect x="36" y="36" width="28" height="28" rx="4" fill="#0A0A0A" />
                    <rect x="42" y="42" width="16" height="16" rx="2" fill="#FFFFFF" />
                    <circle cx="50" cy="50" r="4" fill="#0A0A0A" />
                    <rect x="72" y="40" width="8" height="6" fill="#1E293B" />
                    <rect x="84" y="46" width="8" height="8" fill="#1E293B" />
                    <rect x="40" y="70" width="6" height="6" fill="#1E293B" />
                    <rect x="52" y="76" width="8" height="8" fill="#1E293B" />
                    <rect x="68" y="70" width="6" height="6" fill="#0A0A0A" />
                    <rect x="80" y="74" width="8" height="8" fill="#1E293B" />
                    <rect x="70" y="86" width="16" height="6" fill="#1E293B" />
                  </svg>
                </div>

                <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0F172A', marginBottom: '14px' }}>
                  Amount: ₹{Number(amount).toFixed(2)}
                </div>

                <button
                  type="button"
                  onClick={() => initiateRazorpayCheckout('upi')}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#FFB800',
                    color: '#0A0A0A',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(255, 184, 0, 0.35)',
                  }}
                >
                  ✓ I Have Scanned & Paid
                </button>
              </div>
            </div>
          ) : (
            /* MAIN PAYMENT SELECTION (Exact match to reference screenshot) */
            <div>
              {/* SECTION 1: UPI PAYMENT */}
              <div style={{ marginBottom: '20px' }}>
                <h4
                  style={{
                    fontSize: '1.02rem',
                    fontWeight: '800',
                    color: '#111827',
                    margin: '0 0 12px 2px',
                    letterSpacing: '-0.2px',
                  }}
                >
                  UPI Payment
                </h4>

                {/* 2x2 Grid of UPI Options */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                  }}
                >
                  {/* 1. PhonePe */}
                  <div
                    onClick={() => setSelectedMethod('phonepe')}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      border: selectedMethod === 'phonepe' ? '2px solid #FFB800' : '1px solid #E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow:
                        selectedMethod === 'phonepe'
                          ? '0 4px 12px rgba(255, 184, 0, 0.25)'
                          : '0 1px 3px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: '#5F259F',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          color: '#FFFFFF',
                          fontWeight: '900',
                          fontSize: '1.2rem',
                          lineHeight: 1,
                          fontFamily: 'sans-serif',
                        }}
                      >
                        पे
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: '700',
                        color: '#1F2937',
                      }}
                    >
                      PhonePe
                    </span>
                  </div>

                  {/* 2. Google Pay */}
                  <div
                    onClick={() => setSelectedMethod('gpay')}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      border: selectedMethod === 'gpay' ? '2px solid #FFB800' : '1px solid #E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow:
                        selectedMethod === 'gpay'
                          ? '0 4px 12px rgba(255, 184, 0, 0.25)'
                          : '0 1px 3px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontWeight: '800', fontSize: '0.8rem', letterSpacing: '-0.5px' }}>
                        <span style={{ color: '#4285F4' }}>G</span>
                        <span style={{ color: '#EA4335' }}>P</span>
                        <span style={{ color: '#FBBC05' }}>a</span>
                        <span style={{ color: '#34A853' }}>y</span>
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: '700',
                        color: '#1F2937',
                      }}
                    >
                      Google Pay
                    </span>
                  </div>

                  {/* 3. PayTM */}
                  <div
                    onClick={() => setSelectedMethod('paytm')}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      border: selectedMethod === 'paytm' ? '2px solid #FFB800' : '1px solid #E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow:
                        selectedMethod === 'paytm'
                          ? '0 4px 12px rgba(255, 184, 0, 0.25)'
                          : '0 1px 3px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontWeight: '900', fontSize: '0.62rem', color: '#00B9F1', letterSpacing: '-0.2px' }}>
                        pay<span style={{ color: '#002E6E' }}>tm</span>
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: '700',
                        color: '#1F2937',
                      }}
                    >
                      PayTM
                    </span>
                  </div>

                  {/* 4. Apps & UPI QR */}
                  <div
                    onClick={() => {
                      setSelectedMethod('apps_qr');
                      setActiveSubView('qr_modal');
                    }}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      border: selectedMethod === 'apps_qr' ? '2px solid #FFB800' : '1px solid #E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow:
                        selectedMethod === 'apps_qr'
                          ? '0 4px 12px rgba(255, 184, 0, 0.25)'
                          : '0 1px 3px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        backgroundColor: '#F3F4F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: '#4B5563',
                      }}
                    >
                      <QrCode size={18} />
                    </div>
                    <span
                      style={{
                        fontSize: '0.84rem',
                        fontWeight: '700',
                        color: '#1F2937',
                        lineHeight: 1.2,
                      }}
                    >
                      Apps & UPI QR
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: OTHER METHODS */}
              <div style={{ marginBottom: '16px' }}>
                <h4
                  style={{
                    fontSize: '1.02rem',
                    fontWeight: '800',
                    color: '#111827',
                    margin: '0 0 12px 2px',
                    letterSpacing: '-0.2px',
                  }}
                >
                  Other Methods
                </h4>

                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E5E7EB',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  {/* Row 1: Debit/Credit Card */}
                  <div
                    onClick={() => {
                      setSelectedMethod('card');
                      setActiveSubView('card_form');
                    }}
                    style={{
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      borderBottom: '1px solid #F3F4F6',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <CreditCard size={20} color="#374151" strokeWidth={2.2} />
                      <span style={{ fontWeight: '700', fontSize: '0.92rem', color: '#1F2937' }}>
                        Debit/Credit Card
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span
                          style={{
                            fontSize: '0.62rem',
                            fontWeight: '900',
                            color: '#1A1F71',
                            backgroundColor: '#EEF2FF',
                            padding: '2px 5px',
                            borderRadius: '4px',
                          }}
                        >
                          VISA
                        </span>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#FFF1F2',
                            padding: '3px 5px',
                            borderRadius: '4px',
                          }}
                        >
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EB001B', marginRight: '-3px' }} />
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F79E1B' }} />
                        </div>
                        <span
                          style={{
                            fontSize: '0.58rem',
                            fontWeight: '800',
                            color: '#047857',
                            backgroundColor: '#ECFDF5',
                            padding: '2px 4px',
                            borderRadius: '4px',
                          }}
                        >
                          RuPay
                        </span>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: '700',
                            color: '#6B7280',
                            backgroundColor: '#F3F4F6',
                            padding: '2px 4px',
                            borderRadius: '4px',
                          }}
                        >
                          +2
                        </span>
                      </div>

                      <ChevronRight size={18} color="#9CA3AF" />
                    </div>
                  </div>

                  {/* Row 2: Net Banking */}
                  <div
                    onClick={() => {
                      setSelectedMethod('netbanking');
                      setActiveSubView('bank_selector');
                    }}
                    style={{
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Building2 size={20} color="#374151" strokeWidth={2.2} />
                      <span style={{ fontWeight: '700', fontSize: '0.92rem', color: '#1F2937' }}>
                        Net Banking
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div
                          style={{
                            width: '14px',
                            height: '14px',
                            backgroundColor: '#004C8F',
                            borderRadius: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <div style={{ width: '6px', height: '6px', backgroundColor: '#ED1C24' }} />
                        </div>
                        <div
                          style={{
                            width: '14px',
                            height: '14px',
                            backgroundColor: '#B52F20',
                            borderRadius: '50%',
                          }}
                        />
                        <div
                          style={{
                            width: '14px',
                            height: '14px',
                            backgroundColor: '#280071',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <div style={{ width: '4px', height: '4px', backgroundColor: '#FFFFFF', borderRadius: '50%' }} />
                        </div>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: '700',
                            color: '#6B7280',
                            backgroundColor: '#F3F4F6',
                            padding: '2px 4px',
                            borderRadius: '4px',
                          }}
                        >
                          +57
                        </span>
                      </div>

                      <ChevronRight size={18} color="#9CA3AF" />
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER TRUST BADGE */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 0 6px 0',
                  color: '#6B7280',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                }}
              >
                <span>Powered by</span>
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: '#5F259F',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    fontWeight: '900',
                  }}
                >
                  पे
                </div>
                <span style={{ fontWeight: '800', color: '#5F259F' }}>PhonePe</span>
                <span style={{ color: '#CBD5E1' }}>•</span>
                <span style={{ color: '#2563EB', fontWeight: '800' }}>⚡ Razorpay</span>
              </div>
            </div>
          )}
        </div>

        {/* PRICE BREAKUP POPUP DRAWER */}
        {isBreakupOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: '120px',
              left: '16px',
              right: '16px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              border: '1px solid #E2E8F0',
              zIndex: 10,
              animation: 'opmSlideUp 0.2s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0F172A' }}>
                Order Price Breakup
              </div>
              <button
                type="button"
                onClick={() => setIsBreakupOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Item Total ({orderItems.length || 1} items)</span>
                <span style={{ fontWeight: '700', color: '#0F172A' }}>
                  ₹{(summary.subtotal || amount).toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Delivery & Logistics</span>
                <span style={{ fontWeight: '700', color: '#0A0A0A' }}>FREE</span>
              </div>
              {summary.gstAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Estimated GST (18%)</span>
                  <span style={{ fontWeight: '700', color: '#0F172A' }}>
                    ₹{Number(summary.gstAmount).toFixed(2)}
                  </span>
                </div>
              )}
              {summary.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0A0A0A' }}>
                  <span>Discounts Applied</span>
                  <span style={{ fontWeight: '700' }}>
                    -₹{Number(summary.discountAmount).toFixed(2)}
                  </span>
                </div>
              )}
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '0.95rem', color: '#0F172A' }}>
                <span>Net Payable</span>
                <span>₹{Number(amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM STICKY ACTION BAR */}
        {!isSuccess && !isProcessing && activeSubView !== 'failed_recovery' && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #EEF2F6',
              padding: '12px 18px 10px 18px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: '900',
                    color: '#0F172A',
                    lineHeight: 1.1,
                    letterSpacing: '-0.5px',
                  }}
                >
                  ₹{Number(amount).toFixed(2)}
                </div>
                <button
                  type="button"
                  onClick={() => setIsBreakupOpen(!isBreakupOpen)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    margin: '3px 0 0 0',
                    color: '#0A0A0A',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'block',
                    textAlign: 'left',
                  }}
                >
                  {isBreakupOpen ? 'Hide Breakup' : 'View Breakup'}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handlePayClick}
                  style={{
                    backgroundColor: '#FFB800',
                    color: '#0A0A0A',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 34px',
                    fontSize: '1.02rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(255, 184, 0, 0.4)',
                    transition: 'all 0.15s ease',
                    letterSpacing: '0.2px',
                  }}
                >
                  Pay
                </button>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#FFF8E1',
                borderRadius: '20px',
                padding: '7px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.76rem',
                color: '#0A0A0A',
                fontWeight: '600',
              }}
            >
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: '#FFB800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0A0A0A',
                }}
              >
                <Clock size={9} strokeWidth={3} />
              </div>
              <span>
                This page will timeout in <strong>{formatTimeout(timerSeconds)} mins</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes opmFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes opmSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes opmSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OnlinePaymentModal;
