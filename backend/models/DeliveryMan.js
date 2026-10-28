import { createAppModel } from './appModel.js';

// A delivery person saved by a vendor, so they can be picked when an order is shipped.
const DeliveryMan = createAppModel('DeliveryMan', {
  collection: 'deliverymen',
  fields: {
    vendorId: { type: String, index: true },
    name: String,
    phone: String,
    vehicleType: String,
    vehicleNumber: String,
    notes: String,
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
});

export default DeliveryMan;
