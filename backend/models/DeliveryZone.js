import { createAppModel } from './appModel.js';

// A delivery zone: a set of pincodes served together with one delivery promise
// (etaMinutes, 180 = 3 hours by default). Vendors choose the zones they deliver to.
const DeliveryZone = createAppModel('DeliveryZone', {
  collection: 'deliveryzones',
  fields: {
    name: String,
    city: String,
    pincodes: { type: [String], index: true },
    etaMinutes: Number,
    active: { type: Boolean, default: true },
  },
});

export default DeliveryZone;
