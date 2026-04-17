import { Router } from 'express';
import { login, googleLogin } from '../controllers/authController.js';
import { sendOtp, verifyOtp, resendOtp } from '../controllers/smsOtpController.js';

const router = Router();

// Traditional login routes
router.post('/login', login);
router.post('/google-login', googleLogin);

// SMS OTP authentication routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

export default router;