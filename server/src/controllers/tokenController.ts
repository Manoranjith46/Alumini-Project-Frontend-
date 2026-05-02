import crypto from 'crypto';
import mongoose from 'mongoose';
import type { Request, Response } from 'express';
import MailToken from '../models/mailToken.js';
import MailResponse from '../models/mailResponse.js';
import Mail from '../models/mail.js';
import User from '../models/user.js';
import Alumni from '../models/alumni.js';
import { hashPassword } from '../security/bcrypt.js';
import { generateToken } from '../security/jwt.js';
import { sendAdminNotification } from './mailController.js';

/**
 * Helper function to create or find alumni user and return auth data
 */
async function createOrFindAlumniUser(email: string, responseData: any = {}): Promise<any> {
  try {
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      const token = generateToken({ id: user._id.toString(), role: user.role });

      return {
        token,
        user: {
          id: user._id,
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    }

    const tempRegNum = Date.now().toString().slice(-11);

    const randomPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await hashPassword(randomPassword);

    user = await User.create({
      userId: tempRegNum,
      name: responseData.fullName || email.split('@')[0],
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'alumni'
    });

    const alumniData = {
      userId: user._id,
      registerNumber: tempRegNum,
      name: responseData.fullName || email.split('@')[0],
      email: email.toLowerCase(),
      dob: new Date('2000-01-01'),
      yearFrom: responseData.batchYear?.startYear || 2020,
      yearTo: responseData.batchYear?.endYear || 2024,
      degree: 'Pending',
      branch: 'Pending',
      designation: responseData.designation || '',
      presentAddress: {
        city: responseData.location || '',
        mobile: responseData.mobileNo || ''
      }
    };

    await Alumni.create(alumniData);

    console.log(`✅ Created new alumni user: ${email}`);

    const token = generateToken({ id: user._id.toString(), role: user.role });

    return {
      token,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Error creating/finding alumni user:', error);
    throw error;
  }
}

/**
 * Generate secure tokens for a mail and its recipients
 */
export const generateTokensForMail = async (mailId: string, recipientEmails: string[]): Promise<any[]> => {
  try {
    const tokens = [];
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    for (const email of recipientEmails) {
      const token = crypto.randomBytes(32).toString('hex');

      await MailToken.create({
        token,
        mailId,
        recipientEmail: email,
        isTokenValid: true,
        expiresAt
      });

      tokens.push({
        email,
        token
      });
    }

    console.log(`✅ Generated ${recipientEmails.length} token(s) for recipients`);
    return tokens;
  } catch (error) {
    console.error('❌ Error generating tokens:', error);
    throw new Error('Failed to generate tokens');
  }
};

/**
 * Validate a token without consuming it
 */
export const validateToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.params.token as string;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Token is required'
      });
      return;
    }

    const tokenRecord = await MailToken.findValidToken(token);

    if (!tokenRecord) {
      res.status(404).json({
        success: false,
        message: 'Invalid, expired, or already used token'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      tokenInfo: {
        recipientEmail: tokenRecord.recipientEmail,
        mailId: (tokenRecord.mailId as any)._id,
        mailTitle: (tokenRecord.mailId as any).title,
        mailContent: (tokenRecord.mailId as any).content,
        expiresAt: tokenRecord.expiresAt
      }
    });

  } catch (error) {
    console.error('Error validating token:', error);
    res.status(500).json({
      success: false,
      message: 'Token validation failed'
    });
  }
};

/**
 * Get token information without consuming it
 */
export const getTokenInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.params.token as string;

    const tokenRecord = await MailToken.findValidToken(token);

    if (!tokenRecord) {
      res.status(404).json({
        success: false,
        message: 'Invalid, expired, or already used token'
      });
      return;
    }

    res.status(200).json({
      success: true,
      tokenInfo: {
        recipientEmail: tokenRecord.recipientEmail,
        mail: {
          id: (tokenRecord.mailId as any)._id,
          title: (tokenRecord.mailId as any).title,
          content: (tokenRecord.mailId as any).content,
          senderName: (tokenRecord.mailId as any).senderName,
          senderEmail: (tokenRecord.mailId as any).senderEmail
        },
        expiresAt: tokenRecord.expiresAt,
        createdAt: tokenRecord.createdAt
      }
    });

  } catch (error) {
    console.error('Error getting token info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get token information'
    });
  }
};

/**
 * Submit form response using token
 */
export const submitTokenResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.params.token as string;
    const { action, responseData } = req.body;

    if (!['accept', 'reject'].includes(action)) {
      res.status(400).json({
        success: false,
        message: 'Invalid action. Must be accept or reject'
      });
      return;
    }

    const tokenRecord = await MailToken.findValidToken(token);

    if (!tokenRecord) {
      res.status(404).json({
        success: false,
        message: 'Invalid, expired, or already used token'
      });
      return;
    }

    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress;

    const mailResponse = await MailResponse.createResponse({
      mailId: tokenRecord.mailId._id,
      tokenId: tokenRecord._id,
      recipientEmail: tokenRecord.recipientEmail,
      action,
      responseData,
      userAgent,
      ipAddress
    });

    await tokenRecord.markAsUsed(userAgent, ipAddress);

    console.log(`✅ Response submitted for token: ${token.substring(0, 8)}...`);

    try {
        const mail = tokenRecord.mailId; 
        const notificationData = {
            ...responseData,
            recipientEmail: tokenRecord.recipientEmail
        };

        await sendAdminNotification(notificationData, mail, action);
        console.log(`📧 Admin notification sent for ${action} response`);
    } catch (notificationError: any) {
        console.error('⚠️ Warning: Admin notification failed:', notificationError.message);
    }

    let userData = null;
    try {
      const email = responseData?.personalEmail || tokenRecord.recipientEmail;
      userData = await createOrFindAlumniUser(email, responseData);
    } catch (error: any) {
      console.error('Warning: Could not create user session:', error.message);
    }

    res.status(201).json({
      success: true,
      message: `Response ${action}ed successfully`,
      responseId: mailResponse._id,
      submittedAt: mailResponse.submittedAt,
      token: userData?.token, 
      user: userData?.user   
    });

  } catch (error: any) {
    console.error('Error submitting token response:', error);

    if (error.message?.includes('Missing required fields')) {
      res.status(400).json({
        success: false,
        message: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit response'
    });
  }
};

/**
 * Simple reject response using token
 */
export const rejectTokenResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.params.token as string;
    const { rejectionReason } = req.body;

    const tokenRecord = await MailToken.findValidToken(token);

    if (!tokenRecord) {
      res.status(404).json({
        success: false,
        message: 'Invalid, expired, or already used token'
      });
      return;
    }

    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress;

    const responseData = rejectionReason ? { rejectionReason } : {};

    const mailResponse = await MailResponse.create({
      mailId: tokenRecord.mailId._id,
      tokenId: tokenRecord._id,
      recipientEmail: tokenRecord.recipientEmail,
      action: 'reject',
      responseData,
      userAgent,
      ipAddress
    });

    await tokenRecord.markAsUsed(userAgent, ipAddress);

    try {
        const mail = tokenRecord.mailId; 
        const notificationData = {
            rejectionReason,
            recipientEmail: tokenRecord.recipientEmail
        };

        await sendAdminNotification(notificationData, mail, 'reject');
        console.log(`📧 Admin notification sent for rejection response`);
    } catch (notificationError: any) {
        console.error('⚠️ Warning: Admin notification failed:', notificationError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Invitation rejected successfully',
      responseId: mailResponse._id
    });

  } catch (error) {
    console.error('Error rejecting token response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject invitation'
    });
  }
};

/**
 * Get statistics for a mail (admin only)
 */
export const getMailTokenStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const mailId = req.params.mailId as string;

    const mail = await Mail.findById(mailId);

    if (!mail) {
      res.status(404).json({
        success: false,
        message: 'Mail not found'
      });
      return;
    }

    const tokenStats = await MailToken.aggregate([
      {
        $match: {
          mailId: new mongoose.Types.ObjectId(mailId)
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          used: { $sum: { $cond: [{ $eq: ['$isTokenValid', false] }, 1, 0] } },
          valid: { $sum: { $cond: ['$isTokenValid', 1, 0] } }
        }
      }
    ]);

    const responseStats = await (MailResponse as any).getMailStats(mailId);

    const stats = {
      mail: {
        id: mail._id,
        title: mail.title,
        recipientCount: mail.recipientCount,
        sentAt: mail.createdAt
      },
      tokens: tokenStats[0] || { total: 0, used: 0, valid: 0 },
      responses: responseStats
    };

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error getting mail token stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get token statistics'
    });
  }
};

/**
 * Get all responses for a mail (admin only)
 */
export const getMailResponses = async (req: Request, res: Response): Promise<void> => {
  try {
    const mailId = req.params.mailId as string;

    const responses = await (MailResponse as any).getResponsesForMail(mailId as string);

    const formattedResponses = responses.map((response: any) => response.getFormattedResponse());

    res.status(200).json({
      success: true,
      responses: formattedResponses,
      total: formattedResponses.length
    });

  } catch (error) {
    console.error('Error getting mail responses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get mail responses'
    });
  }
};
