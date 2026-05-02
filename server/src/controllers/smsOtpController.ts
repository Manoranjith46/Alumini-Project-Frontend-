import type { Request, Response } from 'express';
import { sendSmsOtp, verifySmsOtp } from '../utils/messenger.js';
import User from '../models/user.js';
import { hashPassword } from '../security/bcrypt.js';
import { generateToken } from '../security/jwt.js';

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || !/^\+\d{1,15}$/.test(phoneNumber)) {
      res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Use E.164 format: +91XXXXXXXXXX',
      });
      return;
    }

    const result = await sendSmsOtp(phoneNumber);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.message,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: result.message,
      verificationSid: result.verificationSid,
    });
  } catch (error) {
    console.error('[SmsOtpController] sendOtp error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !/^\+\d{1,15}$/.test(phoneNumber)) {
      res.status(400).json({
        success: false,
        message: 'Invalid phone number format',
      });
      return;
    }

    if (!code || !/^\d{6}$/.test(code)) {
      res.status(400).json({
        success: false,
        message: 'OTP must be a 6-digit code',
      });
      return;
    }

    const verifyResult = await verifySmsOtp(phoneNumber, code);

    if (!verifyResult.success) {
      res.status(401).json({
        success: false,
        message: verifyResult.message,
      });
      return;
    }

    let user = await User.findOne({ email: phoneNumber });

    if (!user) {
      const numberOnly = phoneNumber.replace(/\D/g, '');

      const newUser = new User({
        userId: numberOnly,
        name: `User_${numberOnly.slice(-6)}`,
        email: phoneNumber,
        password: await hashPassword(`sms_auth_${phoneNumber}`),
        role: 'alumni',
      });

      try {
        user = await newUser.save();
      } catch (saveError: any) {
        if (saveError.code === 11000) {
          user = await User.findOne({ email: phoneNumber });
          if (!user) throw saveError;
        } else {
          throw saveError;
        }
      }
    }

    const token = generateToken({ id: user._id, role: user.role });

    res.status(200).json({
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
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || !/^\+\d{1,15}$/.test(phoneNumber)) {
      res.status(400).json({
        success: false,
        message: 'Invalid phone number format',
      });
      return;
    }

    const result = await sendSmsOtp(phoneNumber);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.message,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      verificationSid: result.verificationSid,
    });
  } catch (error) {
    console.error('[SmsOtpController] resendOtp error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
