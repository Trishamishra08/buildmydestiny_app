import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  getVendorProfile,
  updateVendorProfile,
  getVendorStats,
  listMyProducts,
  createMyProduct,
  updateMyProduct,
  deleteMyProduct,
  listMyOrders,
  updateMyOrderItemStatus,
  listVendors,
  setVendorStatus,
  requireApprovedVendor,
} from '../controllers/vendorController.js';

const router = express.Router();

const vendorOnly = [protect, authorize('vendor')];
const adminOnly = [protect, authorize('admin')];

// Vendor's own profile & dashboard (allowed even while pending approval, so they can see their status)
router.get('/me', ...vendorOnly, getVendorProfile);
router.put('/me', ...vendorOnly, updateVendorProfile);
router.get('/stats', ...vendorOnly, getVendorStats);

// Vendor's own products
router.get('/products', ...vendorOnly, listMyProducts);
router.post('/products', ...vendorOnly, requireApprovedVendor, createMyProduct);
router.put('/products/:key', ...vendorOnly, requireApprovedVendor, updateMyProduct);
router.patch('/products/:key', ...vendorOnly, requireApprovedVendor, updateMyProduct);
router.delete('/products/:key', ...vendorOnly, deleteMyProduct);

// Orders containing the vendor's products
router.get('/orders', ...vendorOnly, listMyOrders);
router.patch('/orders/:orderId/items/:productId/status', ...vendorOnly, updateMyOrderItemStatus);

// Admin: vendor account approval
router.get('/admin/list', ...adminOnly, listVendors);
router.patch('/admin/:id/status', ...adminOnly, setVendorStatus);

export default router;
