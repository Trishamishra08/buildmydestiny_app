import orderCrud, { placeOrder, patchOrder, trackOrder } from '../controllers/orderController.js';
import { ownedRouter } from './routeFactory.js';
import { protect } from '../middlewares/authMiddleware.js';

// /api/orders - customers place (server-priced) and read their own, admins manage all
const router = ownedRouter({ ...orderCrud, patch: patchOrder }, { create: placeOrder });

// Delivery status, rider and time left (delivery is managed by each vendor)
router.get('/:key/track', protect, trackOrder);

export default router;
