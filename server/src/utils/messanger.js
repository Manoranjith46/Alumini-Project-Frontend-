import { getTwilioClient } from '../config/twilio.js';

/**
 * Send OTP via SMS using Twilio Verify API
 * @param {string} phoneNumber - Phone number in E.164 format (e.g., +91XXXXXXXXXX)
 * @returns {Promise<Object>} - Response from Twilio Verify API with status and SID
 */
export const sendSmsOtp = async (phoneNumber) => {
  try {
    const { verifyService } = getTwilioClient();
    const verification = await verifyService.verifications.create({
      to: phoneNumber,
      channel: 'sms',
    });

    return {
      success: true,
      message: 'OTP sent successfully',
      verificationSid: verification.sid,
      status: verification.status,
    };
  } catch (error) {
    console.error('[SmsMessenger] Error sending OTP:', error);
    return {
      success: false,
      message: error.message || 'Failed to send OTP',
      error: error.message,
    };
  }
};

/**
 * Verify OTP code via Twilio Verify API
 * @param {string} phoneNumber - Phone number in E.164 format (e.g., +91XXXXXXXXXX)
 * @param {string} code - 6-digit OTP code entered by user
 * @returns {Promise<Object>} - Response from Twilio Verify API with status
 */
export const verifySmsOtp = async (phoneNumber, code) => {
  try {
    const { verifyService } = getTwilioClient();
    const verificationCheck = await verifyService.verificationChecks.create({
      to: phoneNumber,
      code: code,
    });

    if (verificationCheck.status === 'approved') {
      return {
        success: true,
        message: 'OTP verified successfully',
        status: verificationCheck.status,
      };
    } else {
      return {
        success: false,
        message: 'Invalid OTP code',
        status: verificationCheck.status,
      };
    }
  } catch (error) {
    console.error('[SmsMessenger] Error verifying OTP:', error);
    return {
      success: false,
      message: error.message || 'Failed to verify OTP',
      error: error.message,
    };
  }
};
