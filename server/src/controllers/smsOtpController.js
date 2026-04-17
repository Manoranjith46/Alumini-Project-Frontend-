import { sendSmsOtp, verifySmsOtp } from '../utils/messanger.js';
import User from '../models/user.js';
import { hashPassword } from '../security/bycrypt.js';
import { generateToken } from '../security/jwt.js';

/**
 * Send OTP to phone number
 * @route POST /api/auth/send-otp
 * @access Public
 */
export const sendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Validate phone number format
    if (!phoneNumber || !/^\+\d{1,15}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Use E.164 format: +91XXXXXXXXXX',
      });
    }

    // Send OTP via Twilio
    const result = await sendSmsOtp(phoneNumber);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      verificationSid: result.verificationSid,
    });
  } catch (error) {
    console.error('[SmsOtpController] sendOtp error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message,
    });
  }
};

/**
 * Verify OTP and authenticate user
 * @route POST /api/auth/verify-otp
 * @access Public
 * Creates new user if they don't exist (for first-time SMS login)
 */
export const verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;

    // Validate inputs
    if (!phoneNumber || !/^\+\d{1,15}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format',
      });
    }

    if (!code || !/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be a 6-digit code',
      });
    }

    // Verify OTP with Twilio
    const verifyResult = await verifySmsOtp(phoneNumber, code);

    if (!verifyResult.success) {
      return res.status(401).json({
        success: false,
        message: verifyResult.message,
      });
    }

    // OTP verified successfully - Find or create user
    let user = await User.findOne({ email: phoneNumber });

    if (!user) {
      // Create new user for first-time SMS login
      // Extract country code and number for userId generation
      const numberOnly = phoneNumber.replace(/\D/g, '');

      const newUser = new User({
        userId: numberOnly, // Store phone number without + as userId
        name: `User_${numberOnly.slice(-6)}`, // Default name based on phone
        email: phoneNumber, // Use phone as email for identification
        password: await hashPassword(`sms_auth_${phoneNumber}`), // Generate secure password
        role: 'alumni', // Default role for SMS login users
      });

      try {
        user = await newUser.save();
      } catch (saveError) {
        // Handle duplicate key error
        if (saveError.code === 11000) {
          user = await User.findOne({ email: phoneNumber });
        } else {
          throw saveError;
        }
      }
    }

    // Generate JWT token
    const token = generateToken({ id: user._id, role: user.role });

    // Return user data and token
    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[SmsOtpController] verifyOtp error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message,
    });
  }
};

/**
 * Resend OTP to phone number
 * @route POST /api/auth/resend-otp
 * @access Public
 */
export const resendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || !/^\+\d{1,15}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format',
      });
    }

    const result = await sendSmsOtp(phoneNumber);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      verificationSid: result.verificationSid,
    });
  } catch (error) {
    console.error('[SmsOtpController] resendOtp error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message,
    });
  }
};
