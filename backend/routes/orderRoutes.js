import orderCrud, { placeOrder, patchOrder } from '../controllers/orderController.js';
import { ownedRouter } from './routeFactory.js';

// /api/orders - customers place (server-priced) and read their own, admins manage all
export default ownedRouter({ ...orderCrud, patch: patchOrder }, { create: placeOrder });
