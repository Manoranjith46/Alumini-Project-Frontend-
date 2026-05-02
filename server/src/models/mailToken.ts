import mongoose, { type Types, type Document, type Model, type HydratedDocument } from 'mongoose';

const { Schema } = mongoose;

export interface IMailToken {
  token: string;
  mailId: Types.ObjectId;
  recipientEmail: string;
  isTokenValid: boolean;
  expiresAt: Date;
  usedAt?: Date;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMailTokenMethods {
  isValid(): boolean;
  markAsUsed(userAgent?: string | null, ipAddress?: string | null): Promise<IMailTokenDocument>;
}

export interface IMailTokenModel extends Model<IMailToken, object, IMailTokenMethods> {
  findValidToken(token: string): Promise<IMailTokenDocument | null>;
  createToken(tokenData: Partial<IMailToken>): Promise<IMailTokenDocument>;
}

export type IMailTokenDocument = HydratedDocument<IMailToken, IMailTokenMethods>;

const mailTokenSchema = new Schema<IMailToken, IMailTokenModel, IMailTokenMethods>({
  token: { type: String, required: true, unique: true, index: true },
  mailId: { type: Schema.Types.ObjectId, ref: 'Mail', required: true, index: true },
  recipientEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
  isTokenValid: { type: Boolean, default: true, index: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  usedAt: { type: Date },
  userAgent: { type: String },
  ipAddress: { type: String }
}, { timestamps: true });

mailTokenSchema.index({ token: 1, isTokenValid: 1, expiresAt: 1 });
mailTokenSchema.index({ mailId: 1, recipientEmail: 1 });

mailTokenSchema.methods.isValid = function(this: IMailTokenDocument): boolean {
  return this.isTokenValid && new Date() < this.expiresAt;
};

mailTokenSchema.methods.markAsUsed = function(this: IMailTokenDocument, userAgent: string | null = null, ipAddress: string | null = null) {
  this.isTokenValid = false;
  this.usedAt = new Date();
  if (userAgent) this.userAgent = userAgent;
  if (ipAddress) this.ipAddress = ipAddress;
  return this.save();
};

mailTokenSchema.statics.findValidToken = function(token: string) {
  return this.findOne({ token, isTokenValid: true, expiresAt: { $gt: new Date() } }).populate('mailId');
};

mailTokenSchema.statics.createToken = function(tokenData: Partial<IMailToken>) {
  if (!tokenData.expiresAt) {
    tokenData.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  return this.create(tokenData);
};

const MailToken = mongoose.model<IMailToken, IMailTokenModel>('MailToken', mailTokenSchema);

export default MailToken;
