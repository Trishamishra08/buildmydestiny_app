import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Setting from '../models/Setting.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { resolveVariantOptions, unitPrice, couponDiscount, computeTotals, resolveGstRate } from './pricing.js';

export class PricingError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

const MAX_LINES = 200;
const MAX_QTY = 100000;

const optionLabel = (opt) => (opt && typeof opt === 'object' ? opt.name ?? opt.label ?? opt.value : opt);

/**
 * Price a cart from the database. Only product ids, quantities, chosen variants and a
 * coupon code are taken from the caller; every amount comes from stored data.
 *
 * @param {Array}  items       cart lines: { product: { id, variantSelection }, quantity }
 * @param {string} couponCode  optional
 * @returns {Promise<{ lines, totals, couponCode }>}
 */
export const priceCart = async ({ items, couponCode, includeUnloading = false }) => {
  if (!Array.isArray(items) || items.length === 0) throw new PricingError('Your cart is empty');
  if (items.length > MAX_LINES) throw new PricingError('Too many items in one order');

  const ids = items.map((item) => String(item?.product?.id ?? item?.productId ?? item?.id ?? ''));
  const products = await Product.find({ id: { $in: ids.filter(Boolean) } }).lean();
  const byId = new Map(products.map(({ _id, ...p }) => [p.id, p]));

  // Tax and commission rules are dynamic: they come from the category (admin) and the
  // product (vendor), falling back to the site settings.
  const slugs = [...new Set(products.map((p) => p.categorySlug).filter(Boolean))];
  const categories = slugs.length ? await Category.find({ slug: { $in: slugs } }).lean() : [];
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
  const { _id: _sid, key: _skey, ...settings } = (await Setting.findOne({ key: 'site' }).lean()) || {};
  const siteGstRate = Number.isFinite(Number(settings.gstRatePercent)) && settings.gstRatePercent !== '' && settings.gstRatePercent != null
    ? Number(settings.gstRatePercent)
    : 18;
  const siteCommission = Number(settings.commissionPercent) || 0;

  // Vendors must be approved and open for orders.
  const vendorIds = [...new Set(products.map((p) => p.vendorId).filter((v) => v && mongoose.Types.ObjectId.isValid(v)))];
  const vendors = vendorIds.length
    ? await User.find({ _id: { $in: vendorIds } }).select('businessName name vendorStatus isAcceptingOrders').lean()
    : [];
  const closed = vendors.find((v) => v.vendorStatus !== 'approved' || v.isAcceptingOrders === false);
  if (closed) {
    throw new PricingError(`${closed.businessName || closed.name} is not accepting orders right now. Please remove their items.`);
  }

  // Total requested per product, so several lines of one product share its stock.
  const requested = new Map();
  items.forEach((item, i) => {
    const q = Math.floor(Number(item?.quantity)) || 0;
    requested.set(ids[i], (requested.get(ids[i]) || 0) + q);
  });

  const lines = items.map((item, i) => {
    const product = byId.get(ids[i]);
    if (!product) throw new PricingError('An item in your cart is no longer available. Please review your cart.');
    if (product.inStock === false) throw new PricingError(`${product.name} is out of stock`);

    const quantity = Math.floor(Number(item?.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > MAX_QTY) {
      throw new PricingError(`Invalid quantity for ${product.name}`);
    }

    if (typeof product.stockCount === 'number' && requested.get(ids[i]) > product.stockCount) {
      throw new PricingError(
        product.stockCount > 0 ? `Only ${product.stockCount} of ${product.name} left in stock` : `${product.name} is out of stock`
      );
    }

    const selection = item?.product?.variantSelection || item?.variantSelection || {};
    const { options, error } = resolveVariantOptions(product, selection);
    if (error) throw new PricingError(error);

    const price = unitPrice(product, quantity, options);
    const variantSummary = options.map(optionLabel).filter(Boolean).join(' • ');

    const category = categoryBySlug.get(product.categorySlug);
    const commissionPercent = [product.commissionPercent, category?.commissionPercent]
      .map((v) => (v === undefined || v === null || v === '' ? NaN : Number(v)))
      .find((v) => !Number.isNaN(v)) ?? siteCommission;

    return {
      gstRatePercent: resolveGstRate(product, category, siteGstRate),
      hsnCode: product.hsnCode || category?.hsnCode || '',
      commissionPercent: product.vendorId ? commissionPercent : 0,
      product: {
        ...product,
        name: variantSummary ? `${product.name} (${variantSummary})` : product.name,
        price,
        variantSelection: selection,
        selectedVariant: variantSummary || undefined,
      },
      quantity,
      price,
      lineTotal: price * quantity,
    };
  });

  const subtotal = lines.reduce((acc, l) => acc + l.lineTotal, 0);

  let coupon = null;
  const code = couponCode ? String(couponCode).trim().toUpperCase() : '';
  if (code) {
    const { _id, ...found } = (await Coupon.findOne({ code }).lean()) || {};
    if (!found.code) throw new PricingError(`Coupon ${code} is not valid`);
    const { reason } = couponDiscount(found, subtotal);
    if (reason) throw new PricingError(`Coupon ${code}: ${reason}`);
    coupon = found;
  }

  const totals = computeTotals({ subtotal, coupon, settings, includeUnloading: Boolean(includeUnloading), lines });

  // Stamp each line with the tax charged on it (used by invoices and vendor settlements).
  const pricedLines = lines.map((line, i) => ({
    ...line,
    gst: totals.gstLines?.[i] || { rate: line.gstRatePercent, taxable: line.lineTotal, amount: 0 },
  }));

  return { lines: pricedLines, totals, couponCode: coupon ? code : null };
};
