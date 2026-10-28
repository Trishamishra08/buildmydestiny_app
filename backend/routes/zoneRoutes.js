import express from 'express';
import DeliveryZone from '../models/DeliveryZone.js';
import buildCrud from '../controllers/crudFactory.js';
import { catalogRouter } from './routeFactory.js';
import { findZoneByPincode, zoneEta, etaLabel } from '../utils/deliveryZones.js';

const zoneCrud = buildCrud(DeliveryZone, { sort: { name: 1 } });

// /api/zones - everyone can read delivery zones, admins manage them
const router = express.Router();

/**
 * @desc  Can we deliver to this pincode, and how fast?
 * @route GET /api/zones/check?pincode=452001
 */
router.get('/check', async (req, res) => {
  try {
    const pincode = String(req.query.pincode || '').trim();
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 6 digit pincode' });
    }
    const zone = await findZoneByPincode(pincode);
    if (!zone) {
      return res.json({ success: true, serviceable: false, message: `We do not deliver to ${pincode} yet` });
    }
    const etaMinutes = zoneEta(zone);
    res.json({
      success: true,
      serviceable: true,
      zone: { id: zone.id, name: zone.name, city: zone.city },
      etaMinutes,
      message: `Delivery in ${zone.name} within ${etaLabel(etaMinutes)}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.use('/', catalogRouter(zoneCrud));

export default router;
