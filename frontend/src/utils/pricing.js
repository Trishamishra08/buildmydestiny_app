/**
 * Order pricing rules - the single definition of how a cart is charged.
 *
 * IMPORTANT: this is a copy of backend/utils/pricing.js, which decides what the customer
 * is actually charged. Change both files together, or customers will see one total at
 * checkout and be charged another.
 */

// Pricing-related defaults, matching the storefront's built-in site settings.
export const DEFAULT_PRICING_SETTINGS = {
  gstRatePercent: 18,
  isGstInclusive: false,
  deliveryType: 'free', // 'free' | 'flat' | 'min_order_free' | 'km_based'
  flatDeliveryFee: 49,
  minFreeDeliveryOrder: 500,
  deliveryBaseKm: 5,
  deliveryBaseFee: 0,
  deliveryPerKmFee: 15,
  estimatedDeliveryKm: 5,
  enableUnloadingFee: true,
  unloadingChargeStandard: 199,
  freeUnloadingThreshold: 50000,
};

// A number, or the fallback when the value is missing. Unlike `Number(v) || fallback`,
// an explicit 0 (e.g. 0% GST, free flat delivery) is respected.
const num = (value, fallback) => {
  if (value === null || value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isNaN(n) ? fallback : n;
};

/**
 * The selectable options (variants / packs) of a product, in one shape:
 * { name, price, mrp, unit, ... }. The admin panel saves them as `variants`
 * ({ label, unit, price, mrp, stockCount, minOrderQty }); older data uses `optionsList`.
 * Names are trimmed and made unique, because a customer's choice is matched by name.
 */
export const getProductOptions = (product) => {
  const source =
    Array.isArray(product?.variants) && product.variants.length > 0
      ? product.variants
      : Array.isArray(product?.optionsList)
        ? product.optionsList
        : [];
  const seen = new Map();
  return source
    .filter((opt) => opt && typeof opt === 'object')
    .map((opt, i) => {
      let name = String(opt.name ?? opt.label ?? '').trim() || String(opt.unit ?? '').trim() || `Option ${i + 1}`;
      const count = seen.get(name) || 0;
      seen.set(name, count + 1);
      if (count > 0) name = `${name} (${count + 1})`;
      return {
        ...opt,
        name,
        price: num(opt.price, undefined),
        mrp: num(opt.mrp, undefined),
      };
    });
};

const optionLabel = (opt) => (opt && typeof opt === 'object' ? opt.name ?? opt.label ?? opt.value : opt);

/**
 * Generate a deterministic key for a cart item based on base product ID and variant selections.
 */
export const getCartItemKey = (productOrItem) => {
  if (!productOrItem) return '';
  const prod = productOrItem.product || productOrItem;
  const baseId = String(prod.id ?? prod._id ?? '');

  if (prod.variantSelection && typeof prod.variantSelection === 'object') {
    const entries = Object.entries(prod.variantSelection)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k}:${typeof v === 'object' ? (v.name || v.label || v.value || '') : v}`)
      .sort();
    if (entries.length > 0) {
      return `${baseId}___${entries.join('|')}`;
    }
  }
  if (prod.selectedVariant) {
    return `${baseId}___${String(prod.selectedVariant).trim()}`;
  }
  if (prod.variant) {
    return `${baseId}___${String(prod.variant).trim()}`;
  }
  return baseId;
};

/**
 * Resolve the chosen variant options of a product.
 * `selection` maps a variant group id (or "default" for a flat options list) to the
 * chosen option's name. Missing choices fall back to the storefront's default option.
 * Returns { options, error }.
 */
export const resolveVariantOptions = (product, selection = {}) => {
  const options = [];
  if (Array.isArray(product?.variantGroups) && product.variantGroups.length > 0) {
    for (const group of product.variantGroups) {
      const groupOptions = Array.isArray(group?.options) ? group.options : [];
      if (!groupOptions.length) continue;
      const wanted = selection?.[group.id] ?? selection?.[group.name];
      const opt =
        wanted !== undefined && wanted !== null
          ? groupOptions.find(
              (o) =>
                String(optionLabel(o)).trim().toLowerCase() === String(wanted).trim().toLowerCase() ||
                String(o?.id || '').trim() === String(wanted).trim()
            )
          : groupOptions.find((o) => o?.isPopular) || groupOptions[0];
      if (!opt) return { options, error: `Unknown option "${wanted}" for ${product.name}` };
      options.push(opt);
    }
  } else if (getProductOptions(product).length > 0) {
    const list = getProductOptions(product);
    const wanted = selection?.default;
    const opt =
      wanted !== undefined && wanted !== null
        ? list.find((o) => o.name.toLowerCase() === String(wanted).trim().toLowerCase())
        : list[0];
    if (!opt) return { options, error: `Unknown option "${wanted}" for ${product.name}` };
    options.push(opt);
  }
  return { options, error: null };
};

/**
 * Price of one unit: the product price, replaced by the last chosen option that has
 * its own price, then by the best matching bulk (wholesale) tier for the quantity.
 */
export const unitPrice = (product, quantity, options = []) => {
  let price = num(product?.price, 0);
  let hasExplicit = false;
  options.forEach((opt) => {
    if (opt && opt.price !== undefined && opt.price !== null && opt.price !== '' && Number(opt.price) > 0) {
      price = num(opt.price, price);
      hasExplicit = true;
    }
  });
  if (!hasExplicit) {
    let delta = 0;
    options.forEach((opt) => {
      if (opt && opt.priceDelta) delta += num(opt.priceDelta, 0);
    });
    price += delta;
  }
  if (Array.isArray(product?.wholesaleTiers)) {
    const tier = [...product.wholesaleTiers]
      .sort((a, b) => num(b?.minQty, 0) - num(a?.minQty, 0))
      .find((t) => quantity >= num(t?.minQty, 0));
    if (tier && tier.price) price = num(tier.price, price);
  }
  return price;
};

/**
 * Discount a coupon gives on a subtotal. Returns { amount, reason } where a non-empty
 * reason explains why the coupon does not apply.
 */
export const couponDiscount = (coupon, subtotal, now = new Date()) => {
  if (!coupon) return { amount: 0, reason: '' };
  if (coupon.isActive === false) return { amount: 0, reason: 'This coupon is no longer active' };
  if (coupon.expiryDate) {
    const expires = new Date(coupon.expiryDate);
    if (!Number.isNaN(expires.getTime()) && expires < now) return { amount: 0, reason: 'This coupon has expired' };
  }
  const minOrder = num(coupon.minOrderValue, 0);
  if (subtotal < minOrder) {
    return { amount: 0, reason: `Minimum order amount of ₹${minOrder.toLocaleString('en-IN')} required` };
  }

  let amount = 0;
  const isFlat = coupon.discountType === 'flat' || (num(coupon.flatAmount || coupon.flatDiscountAmount, 0) > 0 && !num(coupon.discountPercentage, 0));
  if (isFlat) {
    amount = num(coupon.flatAmount || coupon.flatDiscountAmount || coupon.discountAmount, 0);
  } else {
    amount = Math.round(subtotal * (num(coupon.discountPercentage, 0) / 100));
    const cap = num(coupon.maxDiscount, 0);
    if (cap > 0 && amount > cap) amount = cap;
  }
  return { amount: Math.max(0, Math.min(amount, subtotal)), reason: '' };
};

/**
 * GST rate (percent) for one product: its own rate, else its category's rate, else the
 * fallback (the site-wide rate). A rate of 0 is respected.
 */
export const resolveGstRate = (product, category, fallback) => {
  for (const candidate of [product?.gstRatePercent, category?.gstRatePercent]) {
    if (candidate !== undefined && candidate !== null && candidate !== '' && !Number.isNaN(Number(candidate))) {
      return Number(candidate);
    }
  }
  return fallback;
};

/**
 * Everything charged on top of the item subtotal.
 * Pass `lines` ([{ lineTotal, gstRatePercent }]) to charge GST per product; without them the
 * whole subtotal is taxed at the site-wide rate.
 * @returns {{ subtotal, discount, subtotalAfterDiscount, deliveryFee, deliveryNote,
 *             unloadingCharge, gstAmount, isGstInclusive, deliveryType, grandTotal }}
 */
export const computeTotals = ({ subtotal, coupon = null, settings = {}, includeUnloading = false, lines = null }) => {
  const s = { ...DEFAULT_PRICING_SETTINGS, ...(settings || {}) };
  const discount = couponDiscount(coupon, subtotal).amount;
  const subtotalAfterDiscount = Math.max(0, subtotal - discount);

  let deliveryFee = 0;
  let deliveryNote = 'FREE';
  const deliveryType = s.deliveryType || 'free';

  if (subtotal > 0 && deliveryType === 'flat') {
    deliveryFee = num(s.flatDeliveryFee, 0);
    deliveryNote = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`;
  } else if (subtotal > 0 && deliveryType === 'min_order_free') {
    const threshold = num(s.minFreeDeliveryOrder, 500);
    const flatFee = num(s.flatDeliveryFee, 99);
    if (subtotal >= threshold) {
      deliveryNote = `FREE (Orders above ₹${threshold.toLocaleString('en-IN')})`;
    } else {
      deliveryFee = flatFee;
      deliveryNote = `₹${deliveryFee} (Free above ₹${threshold.toLocaleString('en-IN')})`;
    }
  } else if (subtotal > 0 && deliveryType === 'km_based') {
    const km = num(s.estimatedDeliveryKm, 5);
    const baseKm = num(s.deliveryBaseKm, 5);
    const baseFee = num(s.deliveryBaseFee, 0);
    const perKm = num(s.deliveryPerKmFee, 15);
    if (km <= baseKm) {
      deliveryFee = baseFee;
      deliveryNote = baseFee === 0 ? `FREE (within ${baseKm} km)` : `₹${baseFee} (within ${baseKm} km)`;
    } else {
      deliveryFee = baseFee + Math.round((km - baseKm) * perKm);
      deliveryNote = `₹${deliveryFee} (${km} km @ ₹${perKm}/km)`;
    }
  }

  const unloadingCharge =
    subtotal > 0 && Boolean(includeUnloading)
      ? subtotal >= num(s.freeUnloadingThreshold, 50000)
        ? 0
        : num(s.unloadingChargeStandard, 199)
      : 0;

  const siteRate = num(s.gstRatePercent, 18);
  const gstRate = siteRate / 100;
  const isGstInclusive = Boolean(s.isGstInclusive);

  // Each line carries its share of the coupon discount, so tax is on what was actually paid.
  const gstLines = Array.isArray(lines) && lines.length
    ? lines.map((line) => {
        const lineTotal = num(line.lineTotal, 0);
        const share = subtotal > 0 ? Math.round((discount * lineTotal) / subtotal) : 0;
        const net = Math.max(0, lineTotal - share);
        const rate = num(line.gstRatePercent, siteRate);
        const amount = isGstInclusive
          ? Math.round(net * (rate / 100 / (1 + rate / 100)))
          : Math.round(net * (rate / 100));
        return { rate, taxable: isGstInclusive ? net - amount : net, amount };
      })
    : null;

  const gstAmount = gstLines
    ? gstLines.reduce((acc, l) => acc + l.amount, 0)
    : isGstInclusive
      ? Math.round(subtotalAfterDiscount * (gstRate / (1 + gstRate)))
      : Math.round(subtotalAfterDiscount * gstRate);

  const grandTotal = Math.max(
    0,
    subtotalAfterDiscount + deliveryFee + unloadingCharge + (isGstInclusive ? 0 : gstAmount)
  );

  return {
    subtotal,
    discount,
    subtotalAfterDiscount,
    deliveryFee,
    deliveryNote,
    unloadingCharge,
    gstAmount,
    gstLines,
    isGstInclusive,
    deliveryType,
    grandTotal,
  };
};
