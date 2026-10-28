/**
 * GST / tax helpers shared by product listing, vendor profile validation and settlements.
 * The charge itself is computed in utils/pricing.js (shared with the storefront).
 */

// Standard GST slabs (percent) a product can be listed under.
export const GST_SLABS = [0, 0.25, 3, 5, 12, 18, 28];

export const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const PAN_RE = /^[A-Z]{5}\d{4}[A-Z]$/;
export const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const HSN_RE = /^\d{4,8}$/;
export const PINCODE_RE = /^\d{6}$/;

export const isValidGstSlab = (rate) => GST_SLABS.includes(Number(rate));

const round = (n) => Math.round(Number(n) || 0);

/** Same-state sales split GST into CGST + SGST, inter-state sales charge IGST. */
export const splitTax = (amount, vendorState, shipState) => {
  const norm = (v) => String(v || '').trim().toLowerCase();
  const tax = round(amount);
  if (!tax) return { cgst: 0, sgst: 0, igst: 0 };
  if (norm(vendorState) && norm(vendorState) === norm(shipState)) {
    const cgst = Math.floor(tax / 2);
    return { cgst, sgst: tax - cgst, igst: 0 };
  }
  return { cgst: 0, sgst: 0, igst: tax };
};

/**
 * What one order line means for the vendor: the sale, the GST collected on it, the
 * platform's commission (on the taxable value) and what is payable to the vendor.
 * The vendor bears their share of any coupon discount.
 */
export const lineSettlement = (line, { vendorState, shipState } = {}) => {
  const lineTotal = Number(line?.lineTotal ?? (line?.price || 0) * (line?.quantity || 0)) || 0;
  const gst = line?.gst || {};
  const taxable = gst.taxable ?? lineTotal;
  const gstAmount = gst.amount ?? 0;
  const commissionPercent = Number(line?.commissionPercent) || 0;
  const commission = round((taxable * commissionPercent) / 100);
  return {
    sale: lineTotal,
    taxable,
    gstRate: gst.rate ?? null,
    gstAmount,
    ...splitTax(gstAmount, vendorState, shipState),
    hsnCode: line?.hsnCode || line?.product?.hsnCode || '',
    commissionPercent,
    commission,
    payout: round(taxable + gstAmount - commission),
  };
};

export const sumSettlements = (parts) =>
  parts.reduce(
    (acc, p) => ({
      sale: acc.sale + p.sale,
      taxable: acc.taxable + p.taxable,
      gstAmount: acc.gstAmount + p.gstAmount,
      cgst: acc.cgst + p.cgst,
      sgst: acc.sgst + p.sgst,
      igst: acc.igst + p.igst,
      commission: acc.commission + p.commission,
      payout: acc.payout + p.payout,
    }),
    { sale: 0, taxable: 0, gstAmount: 0, cgst: 0, sgst: 0, igst: 0, commission: 0, payout: 0 }
  );
