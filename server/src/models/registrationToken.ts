import { Schema, model, type Document, type Model, type HydratedDocument } from 'mongoose';
import crypto from 'crypto';

export interface IRegistrationToken {
  token: string;
  email: string;
  status: 'pending' | 'completed' | 'expired';
  isUsed: boolean;
  expiresAt: Date;
  usedAt?: Date;
  userAgent?: string;
  ipAddress?: string;
  prefilledData?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRegistrationTokenMethods {
  isValid(): boolean;
  markAsUsed(userAgent?: string, ipAddress?: string): Promise<void>;
  markAsExpired(): Promise<void>;
  currentStatus: string;
}

export interface IRegistrationTokenModel extends Model<IRegistrationToken, object, IRegistrationTokenMethods> {
  findValidToken(token: string): Promise<IRegistrationTokenDocument | null>;
  updateExpiredTokens(): Promise<number>;
  createToken(email: string, prefilledData?: Record<string, unknown> | null, expiryDays?: number): Promise<IRegistrationTokenDocument>;
}

export type IRegistrationTokenDocument = HydratedDocument<IRegistrationToken, IRegistrationTokenMethods>;

const registrationTokenSchema = new Schema<IRegistrationToken, IRegistrationTokenModel, IRegistrationTokenMethods>(
	{
		token: { type: String, required: true, unique: true, index: true },
		email: { type: String, required: true, lowercase: true, trim: true, index: true },
		status: { type: String, enum: ['pending', 'completed', 'expired'], default: 'pending', index: true },
		isUsed: { type: Boolean, default: false, index: true },
		expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
		usedAt: { type: Date },
		userAgent: { type: String },
		ipAddress: { type: String },
		prefilledData: { type: Schema.Types.Mixed, default: null },
	},
	{ timestamps: true }
);

registrationTokenSchema.virtual('currentStatus').get(function (this: IRegistrationTokenDocument) {
	if (this.status === 'completed') return 'completed';
	if (this.expiresAt <= new Date()) return 'expired';
	return 'pending';
});

registrationTokenSchema.methods.isValid = function (this: IRegistrationTokenDocument) {
	return this.status === 'pending' && !this.isUsed && this.expiresAt > new Date();
};

registrationTokenSchema.methods.markAsUsed = async function (this: IRegistrationTokenDocument, userAgent?: string, ipAddress?: string) {
	this.isUsed = true;
	this.status = 'completed';
	this.usedAt = new Date();
	this.userAgent = userAgent;
	this.ipAddress = ipAddress;
	await this.save();
};

registrationTokenSchema.methods.markAsExpired = async function (this: IRegistrationTokenDocument) {
	if (this.status === 'pending') {
		this.status = 'expired';
		await this.save();
	}
};

registrationTokenSchema.statics.findValidToken = async function (token: string) {
	return this.findOne({ token, status: 'pending', isUsed: false, expiresAt: { $gt: new Date() } });
};

registrationTokenSchema.statics.updateExpiredTokens = async function () {
	const result = await this.updateMany(
		{ status: 'pending', expiresAt: { $lte: new Date() } },
		{ $set: { status: 'expired' } }
	);
	return result.modifiedCount;
};

registrationTokenSchema.statics.createToken = async function (email: string, prefilledData: Record<string, unknown> | null = null, expiryDays = 2) {
	const token = crypto.randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
	return this.create({ token, email, expiresAt, prefilledData, status: 'pending' });
};

const RegistrationToken = model<IRegistrationToken, IRegistrationTokenModel>('RegistrationToken', registrationTokenSchema, 'registrationTokens');

export default RegistrationToken;
