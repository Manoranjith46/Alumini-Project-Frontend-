import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getDashboardStats,
  getAcceptedMailResponses,
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
  sendResetOtp,
  verifyResetOtp,
  resetPassword,
  getInstituteBranding,
} from '../controllers/adminController.js';

const router = Router();

// Public route - no authentication required
router.get('/branding', getInstituteBranding);

// Get dashboard statistics (Admin only)
router.get('/dashboard/stats', authenticate, getDashboardStats);

// Get accepted mail responses (Admin only)
router.get('/mail/accepted-responses', authenticate, getAcceptedMailResponses);

// Profile routes
router.get('/profile', authenticate, getAdminProfile);
router.put('/profile', authenticate, updateAdminProfile);
router.put('/profile/password', authenticate, updateAdminPassword);
router.post('/profile/send-otp', authenticate, sendResetOtp);
router.post('/profile/verify-otp', authenticate, verifyResetOtp);
router.post('/profile/reset-password', authenticate, resetPassword);

export default router;