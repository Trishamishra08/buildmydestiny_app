import DeliveryZone from '../models/DeliveryZone.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

export const DEFAULT_ETA_MINUTES = 180; // vendors deliver within 3 hours

export class DeliveryError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

const normPin = (value) => String(value ?? '').replace(/\s+/g, '');

export const zoneEta = (zone) => Number(zone?.etaMinutes) > 0 ? Number(zone.etaMinutes) : DEFAULT_ETA_MINUTES;

export const etaLabel = (minutes) => {
  const m = Math.round(minutes);
  if (m < 60) return `${m} mins`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h} hr ${rest} mins` : `${h} hr${h > 1 ? 's' : ''}`;
};

/** Find the active zone that serves a pincode (null if none). */
export const findZoneByPincode = async (pincode) => {
  const pin = normPin(pincode);
  if (!pin) return null;
  const zone = await DeliveryZone.findOne({ pincodes: pin, active: { $ne: false } }).lean();
  if (!zone) return null;
  const { _id, ...rest } = zone;
  return rest;
};

/** A vendor with no zones selected delivers everywhere the platform does. */
export const vendorServesZone = (vendor, zoneId) => {
  const zones = vendor?.serviceZones || [];
  return zones.length === 0 || zones.includes(zoneId);
};

/**
 * Check an order can be delivered to `address` and work out the delivery promise.
 *
 * - If no zones are configured yet, delivery is unrestricted with the default 3 hour promise.
 * - Otherwise the pincode must be inside a zone and every vendor in the cart must serve it.
 *
 * @returns {{ zone: object|null, etaMinutes: number, vendorIds: string[] }}
 */
export const resolveDelivery = async ({ address, productIds = [] }) => {
  const activeZones = await DeliveryZone.countDocuments({ active: { $ne: false } });
  const zone = await findZoneByPincode(address?.pincode);
  const etaMinutes = zoneEta(zone);

  const products = productIds.length
    ? await Product.find({ id: { $in: productIds } }).select('id name vendorId').lean()
    : [];
  const vendorIds = [...new Set(products.map((p) => p.vendorId).filter(Boolean).map(String))];

  if (activeZones === 0) return { zone: null, etaMinutes, vendorIds };

  if (!zone) {
    throw new DeliveryError(
      address?.pincode
        ? `Sorry, we do not deliver to pincode ${address.pincode} yet`
        : 'Please add a delivery address with a pincode'
    );
  }

  if (vendorIds.length) {
    const vendors = await User.find({ _id: { $in: vendorIds }, role: 'vendor' })
      .select('businessName name serviceZones')
      .lean();
    const blocked = vendors.filter((v) => !vendorServesZone(v, zone.id));
    if (blocked.length) {
      const names = blocked.map((v) => v.businessName || v.name).join(', ');
      throw new DeliveryError(`${names} does not deliver to ${zone.name}. Please remove those items or change the address.`);
    }
  }

  return { zone, etaMinutes, vendorIds };
};

/** The address a customer's order is delivered to. */
export const orderAddress = (body = {}) => body.siteAddress || body.shippingAddress || null;
