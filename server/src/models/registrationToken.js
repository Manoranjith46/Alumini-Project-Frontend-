import { Schema, model } from 'mongoose';
import crypto from 'crypto';

const registrationTokenSchema = new Schema(
	{
		token: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		email: {
			type: String,
			required: true,
			lowercase: true,
			trim: true,
			index: true,
		},
		status: {
			type: String,
			enum: ['pending', 'completed', 'expired'],
			default: 'pending',
			index: true,
		},
		isUsed: {
			type: Boolean,
			default: false,
			index: true,
		},
		expiresAt: {
			type: Date,
			required: true,
			index: { expireAfterSeconds: 0 }, // TTL index for auto-cleanup
		},
		usedAt: {
			type: Date,
		},
		userAgent: {
			type: String,
		},
		ipAddress: {
			type: String,
		},
		prefilledData: {
			type: Schema.Types.Mixed,
			default: null,
		},
	},
	{ timestamps: true }
);

// Virtual: Get current status (computed - handles expired check)
registrationTokenSchema.virtual('currentStatus').get(function () {
	if (this.status === 'completed') return 'completed';
	if (this.expiresAt <= new Date()) return 'expired';
	return 'pending';
});

// Instance method: Check if token is valid
registrationTokenSchema.methods.isValid = function () {
	return this.status === 'pending' && !this.isUsed && this.expiresAt > new Date();
};

// Instance method: Mark token as used (completed)
registrationTokenSchema.methods.markAsUsed = async function (userAgent, ipAddress) {
	this.isUsed = true;
	this.status = 'completed';
	this.usedAt = new Date();
	this.userAgent = userAgent;
	this.ipAddress = ipAddress;
	await this.save();
};

// Instance method: Mark token as expired
registrationTokenSchema.methods.markAsExpired = async function () {
	if (this.status === 'pending') {
		this.status = 'expired';
		await this.save();
	}
};

// Static method: Find valid token
registrationTokenSchema.statics.findValidToken = async function (token) {
	const tokenRecord = await this.findOne({
		token,
		status: 'pending',
		isUsed: false,
		expiresAt: { $gt: new Date() },
	});
	return tokenRecord;
};

// Static method: Update expired tokens (call periodically or before queries)
registrationTokenSchema.statics.updateExpiredTokens = async function () {
	const result = await this.updateMany(
		{
			status: 'pending',
			expiresAt: { $lte: new Date() },
		},
		{
			$set: { status: 'expired' },
		}
	);
	return result.modifiedCount;
};

// Static method: Create token with expiry (default 2 days)
registrationTokenSchema.statics.createToken = async function (email, prefilledData = null, expiryDays = 2) {
	const token = crypto.randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

	const tokenRecord = await this.create({
		token,
		email,
		expiresAt,
		prefilledData,
		status: 'pending',
	});

	return tokenRecord;
};

const RegistrationToken = model('RegistrationToken', registrationTokenSchema, 'registrationTokens');

export default RegistrationToken;
