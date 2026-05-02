import type { IUser } from '../models/user.js';
import type { HydratedDocument } from 'mongoose';

declare module 'express' {
  interface Request {
    user?: HydratedDocument<IUser>;
    mailToken?: import('../models/mailToken.js').IMailTokenDocument;
    mail?: unknown;
    recipientEmail?: string;
    clientInfo?: {
      userAgent: string;
      ipAddress: string;
      timestamp: Date;
      referer: string | null;
      origin: string | null;
    };
  }
}
