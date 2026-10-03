import express from 'express';
import {
  registerUser,
  loginUser,
  otpLogin,
  getMe,
  updateFcmToken,
  getFcmTokenStatus,
  getAccountData,
  updateAccountData,
  firebaseLogin,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/otp-login', otpLogin);
router.post('/firebase', firebaseLogin);
router.get('/me', protect, getMe);

// Saved addresses and wishlist for the signed-in account
router.route('/account').get(protect, getAccountData).put(protect, updateAccountData);

// Middleware to optionally authenticate if Bearer token is provided
const optionalProtect = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

// FCM Token Endpoints (supports GET for inspection and POST for saving token)
router.route('/fcm-token')
  .get(getFcmTokenStatus)
  .post(optionalProtect, updateFcmToken);

router.route('/fcm-token/')
  .get(getFcmTokenStatus)
  .post(optionalProtect, updateFcmToken);

export default router;

