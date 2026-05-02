import { Schema, model, type Types, type Document } from 'mongoose';

export interface IPayment {
  user: Types.ObjectId;
  amount: number;
  currency: string;
  purpose: string;
  status: 'created' | 'paid' | 'failed';
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type IPaymentDocument = IPayment & Document;

const paymentSchema = new Schema<IPayment>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		amount: {
			type: Number,
			required: true,
			min: 1,
		},
		currency: {
			type: String,
			default: 'INR',
		},
		purpose: {
			type: String,
			required: true,
			trim: true,
			maxlength: 200,
		},
		status: {
			type: String,
			enum: ['created', 'paid', 'failed'],
			default: 'created',
			index: true,
		},
		razorpayOrderId: {
			type: String,
			required: true,
			unique: true,
		},
		razorpayPaymentId: {
			type: String,
			default: null,
			sparse: true,
		},
		razorpaySignature: {
			type: String,
			default: null,
		},
		paidAt: {
			type: Date,
			default: null,
		},
	},
	{ timestamps: true }
);

const Payment = model<IPayment>('Payment', paymentSchema);

export default Payment;
