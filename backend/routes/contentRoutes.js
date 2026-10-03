import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  couponCrud,
  listCoupons,
  bannerCrud,
  faqCrud,
  cityCrud,
  quotationCrud,
  supportMessageCrud,
  getSettings,
  updateSettings,
} from '../controllers/adminController.js';
import { catalogRouter, inboxRouter, optionalProtect } from './routeFactory.js';

const adminOnly = [protect, authorize('admin')];

// /api/coupons - shoppers see active coupons, admins see and manage all
const coupons = express.Router();
coupons.get('/', optionalProtect, listCoupons);
coupons.get('/:key', ...adminOnly, couponCrud.get);
coupons.post('/', ...adminOnly, couponCrud.upsert);
coupons.put('/:key', ...adminOnly, couponCrud.upsert);
coupons.patch('/:key', ...adminOnly, couponCrud.patch);
coupons.delete('/:key', ...adminOnly, couponCrud.remove);

// /api/settings - public read, admin write
const settings = express.Router();
settings.get('/', getSettings);
settings.put('/', ...adminOnly, updateSettings);

export const couponRoutes = coupons;
export const settingsRoutes = settings;
export const bannerRoutes = catalogRouter(bannerCrud);
export const faqRoutes = catalogRouter(faqCrud);
export const cityRoutes = catalogRouter(cityCrud);
// Guests and shoppers alike may submit a quotation inquiry; only admins list/manage them.
export const quotationRoutes = inboxRouter(quotationCrud);
export const supportMessageRoutes = inboxRouter(supportMessageCrud);
