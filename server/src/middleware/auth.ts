import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type JwtPayload } from '../security/jwt.js';
import User from '../models/user.js';
import type { IUserDocument } from '../models/user.js';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    const token = header.split(' ')[1];
    const decoded = verifyToken(token) as JwtPayload;

    const user = await User.findById(decoded.id).select('-password') as IUserDocument | null;
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    req.user = user as any;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
