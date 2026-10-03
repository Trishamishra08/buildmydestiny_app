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
