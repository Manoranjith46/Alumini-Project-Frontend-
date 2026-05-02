import { Schema, model, type Types, type Document } from 'mongoose';

export interface IInvitation {
  createdBy: Types.ObjectId;
  sender: string;
  subject: string;
  eventDate: Date;
  eventTime: string;
  venue: string;
  description: string;
  flyer: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export type IInvitationDocument = IInvitation & Document;

const invitationSchema = new Schema<IInvitation>(
	{
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		sender: {
			type: String,
			required: true,
			trim: true,
			maxlength: 200,
		},
		subject: {
			type: String,
			required: true,
			trim: true,
			maxlength: 500,
		},
		eventDate: {
			type: Date,
			required: true,
		},
		eventTime: {
			type: String,
			required: true,
			trim: true,
		},
		venue: {
			type: String,
			required: true,
			trim: true,
			maxlength: 300,
		},
		description: {
			type: String,
			required: true,
			trim: true,
			maxlength: 2000,
		},
		flyer: {
			type: Schema.Types.ObjectId,
			ref: 'fs.files',
			default: null,
		},
	},
	{ timestamps: true }
);

const Invitation = model<IInvitation>('Invitation', invitationSchema);

export default Invitation;
