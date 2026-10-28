/**
 * Order fulfilment flow shared by the vendor, admin and customer views.
 *
 * An order moves through six tracking steps. Each vendor fulfils its own line items and
 * reports one of the item statuses below; the customer-facing order status is the
 * *slowest* item, so an order is only "Delivered" once every vendor has delivered.
 */

// Index + 1 === tracking step (matches the customer's OrderTimeline).
export const FLOW = [
  { step: 1, status: 'Placed', code: 'placed', title: 'Order Placed', desc: 'Material order received' },
  { step: 2, status: 'Confirmed', code: 'confirmed', title: 'Order Confirmed', desc: 'Vendor is preparing your materials' },
  { step: 3, status: 'Warehouse Dispatch', code: 'warehouse-dispatch', title: 'Warehouse Dispatch', desc: 'Materials packed and ready to load' },
  { step: 4, status: 'In Transit', code: 'in-transit', title: 'In Transit', desc: 'En route to your construction site' },
  { step: 5, status: 'Out for Delivery', code: 'out-for-delivery', title: 'Out for Delivery', desc: 'Driver will call 30 mins prior' },
  { step: 6, status: 'Delivered', code: 'delivered', title: 'Delivered & Unloaded', desc: 'Delivered at your site' },
];

// What a vendor reports for their own items -> the tracking step it represents.
export const VENDOR_ITEM_STATUSES = ['Processing', 'Ready to Ship', 'Shipped', 'Out for Delivery', 'Delivered'];
const ITEM_STEP = {
  Processing: 2,
  'Ready to Ship': 3,
  Shipped: 4,
  'Out for Delivery': 5,
  Delivered: 6,
};

// Order-level status -> the vendor item status that matches it.
const STATUS_TO_ITEM = {
  Confirmed: 'Processing',
  'Warehouse Dispatch': 'Ready to Ship',
  'In Transit': 'Shipped',
  'Out for Delivery': 'Out for Delivery',
  Delivered: 'Delivered',
};

export const stepForItemStatus = (status) => ITEM_STEP[status] || 2;
export const itemStatusForOrderStatus = (status) => STATUS_TO_ITEM[status] || null;

const nowLabel = () =>
  new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Build the tracking steps for an order that has reached `currentStep`. */
export const buildTracking = (currentStep, previous = {}) => {
  const step = Math.min(Math.max(currentStep, 1), FLOW.length);
  const previousSteps = Array.isArray(previous.steps) ? previous.steps : [];
  return {
    ...previous,
    currentStep: step,
    steps: FLOW.map((f, i) => {
      const done = f.step <= step;
      const old = previousSteps[i] || {};
      return {
        title: f.title,
        desc: f.desc,
        done,
        time: done ? (old.done && old.time && old.time !== 'Pending' && old.time !== 'In Progress' ? old.time : nowLabel()) : 'Pending',
      };
    }),
  };
};

/** The order-level fields implied by reaching `step`. */
export const orderFieldsForStep = (step, previousTracking = {}) => {
  const flow = FLOW[Math.min(Math.max(step, 1), FLOW.length) - 1];
  return {
    status: flow.status,
    statusCode: flow.code,
    tracking: buildTracking(flow.step, previousTracking),
  };
};

/**
 * Order-level fields derived from the vendors' item statuses: the order is only as far
 * along as its slowest item. Returns null if the order has no fulfilment-tracked items.
 */
export const rollupFromItems = (items = [], previousTracking = {}) => {
  if (!items.length) return null;
  const steps = items.map((line) => stepForItemStatus(line.vendorStatus || 'Processing'));
  return orderFieldsForStep(Math.min(...steps), previousTracking);
};

/** Stamp every line item with the vendor status matching an order-level status. */
export const applyStatusToItems = (items = [], status) => {
  const itemStatus = itemStatusForOrderStatus(status);
  if (!itemStatus) return items;
  return items.map((line) => ({ ...line, vendorStatus: itemStatus }));
};

// ---------------------------------------------------------------------------
// Vendor-managed delivery
//
// Each vendor delivers their own items (no courier aggregator). An order keeps one
// "shipment" per vendor: who is delivering, the rider details, the delivery promise
// (zone based, 3 hours by default) and a status history the customer can follow.
// A shipment's status is always derived from its line items, so it can never disagree.
// ---------------------------------------------------------------------------

export const PLATFORM_VENDOR = 'platform';

export const lineVendorId = (line) => String(line?.product?.vendorId || PLATFORM_VENDOR);

/** Forward-only: a vendor may move on (or skip ahead) but never go back or reopen a delivered item. */
export const canMoveItemStatus = (from, to) => {
  const a = VENDOR_ITEM_STATUSES.indexOf(from || 'Processing');
  const b = VENDOR_ITEM_STATUSES.indexOf(to);
  return b > a;
};

/** One shipment per vendor present in the order. */
export const buildShipments = (lines = [], { etaMinutes, promisedBy } = {}) => {
  const byVendor = new Map();
  for (const line of lines) {
    const id = lineVendorId(line);
    if (!byVendor.has(id)) {
      byVendor.set(id, {
        vendorId: id,
        vendorName: line?.product?.vendorName || (id === PLATFORM_VENDOR ? 'BuildMyDestiny' : 'Vendor'),
        rider: { name: '', phone: '', vehicleNumber: '' },
        etaMinutes,
        promisedBy,
        history: [{ status: 'Processing', label: 'Order received by vendor', at: new Date().toISOString() }],
      });
    }
  }
  return [...byVendor.values()];
};

/** Shipment status = the slowest of that vendor's items. */
export const shipmentStatus = (lines = []) => {
  const steps = lines.map((l) => VENDOR_ITEM_STATUSES.indexOf(l.vendorStatus || 'Processing'));
  return VENDOR_ITEM_STATUSES[Math.max(Math.min(...steps), 0)] || 'Processing';
};

const CUSTOMER_LABEL = {
  Processing: 'Vendor is preparing your order',
  'Ready to Ship': 'Packed and ready to ship',
  Shipped: 'Shipped - on the way',
  'Out for Delivery': 'Out for delivery',
  Delivered: 'Delivered',
};
export const statusLabel = (status) => CUSTOMER_LABEL[status] || status;

/** Customer-facing view of an order's delivery: per-vendor progress against the promise. */
export const trackingView = (order, now = new Date()) => {
  const items = order.items || [];
  const shipments = (order.shipments?.length ? order.shipments : buildShipments(items)).map((s) => {
    const lines = items.filter((l) => lineVendorId(l) === s.vendorId);
    const status = shipmentStatus(lines);
    const delivered = status === 'Delivered';
    const promisedAt = s.promisedBy ? new Date(s.promisedBy) : null;
    const minutesLeft = promisedAt && !delivered ? Math.round((promisedAt - now) / 60000) : null;
    return {
      vendorId: s.vendorId,
      vendorName: s.vendorName,
      status,
      message: statusLabel(status),
      step: VENDOR_ITEM_STATUSES.indexOf(status) + 1,
      totalSteps: VENDOR_ITEM_STATUSES.length,
      rider: s.rider ? { name: s.rider.name, phone: s.rider.phone, vehicleNumber: s.rider.vehicleNumber } : null,
      promisedBy: s.promisedBy || null,
      minutesLeft,
      isDelayed: minutesLeft !== null && minutesLeft < 0,
      deliveredAt: delivered ? s.history?.find((h) => h.status === 'Delivered')?.at || null : null,
      items: lines.map((l) => ({ id: l.product?.id, name: l.product?.name, quantity: l.quantity, status: l.vendorStatus || 'Processing' })),
      history: s.history || [],
    };
  });
  return {
    orderId: order.id,
    status: order.status,
    statusCode: order.statusCode,
    managedBy: 'vendor',
    zone: order.deliveryZone || null,
    etaMinutes: order.etaMinutes ?? null,
    promisedBy: order.promisedBy || null,
    tracking: order.tracking,
    shipments,
  };
};
