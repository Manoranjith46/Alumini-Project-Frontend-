import type { Request, Response, NextFunction } from 'express';
import MailToken from '../models/mailToken.js';
import type { IMailTokenDocument } from '../models/mailToken.js';

/**
 * Middleware to validate mail tokens and set request context
 * This middleware validates tokens without consuming them
 */
export const validateMailToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.params.token as string;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Token is required'
      });
      return;
    }

    // Find and validate token
    const tokenRecord = await MailToken.findValidToken(token);

    if (!tokenRecord) {
      res.status(401).json({
        success: false,
        message: 'Invalid, expired, or already used token'
      });
      return;
    }

    // Set request context for subsequent handlers
    req.mailToken = tokenRecord;
    req.mail = tokenRecord.mailId;
    req.recipientEmail = tokenRecord.recipientEmail;

    next();
  } catch (error) {
    console.error('Token validation middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Token validation failed'
    });
  }
};

/**
 * Middleware to validate token and ensure it matches a specific action
 * @param {string} requiredAction - The required action ('accept' or 'reject')
 */
export const validateTokenAction = (requiredAction: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.mailToken) {
      res.status(500).json({
        success: false,
        message: 'Token validation middleware must run first'
      });
      return;
    }

    // @ts-ignore - 'action' was likely removed from IMailToken, but kept for backwards compatibility in middleware
    if ((req.mailToken as any).action && (req.mailToken as any).action !== requiredAction) {
      res.status(400).json({
        success: false,
        // @ts-ignore
        message: `This token is for ${(req.mailToken as any).action}, not ${requiredAction}`
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if token has already been used
 * This is an additional check that can be used for extra security
 */
export const ensureTokenNotUsed = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.mailToken) {
    res.status(500).json({
      success: false,
      message: 'Token validation middleware must run first'
    });
    return;
  }

  if (!req.mailToken.isTokenValid) {
    res.status(409).json({
      success: false,
      message: 'This invitation link has already been used'
    });
    return;
  }

  next();
};

interface TokenAttempt {
  count: number;
  firstAttempt: number;
}

/**
 * Rate limiting middleware for token endpoints
 * Simple implementation - could be enhanced with Redis for production
 */
const tokenAttempts = new Map<string, TokenAttempt>();

export const rateLimitTokenValidation = (req: Request, res: Response, next: NextFunction): void => {
  const clientIp = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 50; // Max 50 attempts per 15 minutes per IP

  // Clean old entries
  for (const [ip, data] of tokenAttempts.entries()) {
    if (now - data.firstAttempt > windowMs) {
      tokenAttempts.delete(ip);
    }
  }

  const clientAttempts = tokenAttempts.get(clientIp);

  if (!clientAttempts) {
    tokenAttempts.set(clientIp, {
      count: 1,
      firstAttempt: now
    });
  } else {
    clientAttempts.count++;

    if (clientAttempts.count > maxAttempts) {
      res.status(429).json({
        success: false,
        message: 'Too many token validation attempts. Please try again later.'
      });
      return;
    }
  }

  next();
};

/**
 * Middleware to log token usage for audit trail
 */
export const logTokenAccess = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.params.token as string;
  const userAgent = req.get('User-Agent');
  const ipAddress = req.ip || req.socket?.remoteAddress || 'unknown';
  const timestamp = new Date().toISOString();

  // Only log if there's actually a token (skip for health checks, etc.)
  if (token) {
    console.log(`[${timestamp}] Token Access - Token: ${token.substring(0, 8)}..., IP: ${ipAddress}, UA: ${userAgent?.substring(0, 100)}`);
  }

  next();
};

/**
 * Middleware to extract and validate client information
 */
export const extractClientInfo = (req: Request, res: Response, next: NextFunction): void => {
  // Extract client information for audit trail
  req.clientInfo = {
    userAgent: req.get('User-Agent') || 'Unknown',
    ipAddress: req.ip || req.socket?.remoteAddress || 'Unknown',
    timestamp: new Date(),
    referer: req.get('Referer') || null,
    origin: req.get('Origin') || null
  };

  next();
};

/**
 * Error handler specifically for token-related errors
 */
export const tokenErrorHandler = (error: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('Token middleware error:', error);

  // Handle specific MongoDB/Mongoose errors
  if (error.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid token format'
    });
    return;
  }

  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Token validation failed'
    });
    return;
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error during token processing'
  });
};
