import { Schema, model, type Document } from 'mongoose';

export interface IRecipient {
  name: string;
  email: string;
  department: string;
  batch: string;
}

export interface IDraft {
  senderId: string;
  senderName: string;
  senderEmail: string;
  recipients: IRecipient[];
  recipientName: string;
  recipientEmail: string;
  department: string;
  batch: string;
  title: string;
  content: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IDraftDocument = IDraft & Document;

// Recipient sub-schema for multiple alumni support
const recipientSchema = new Schema<IRecipient>({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  department: { type: String, default: '' },
  batch: { type: String, default: '' },
}, { _id: false });

const draftSchema = new Schema<IDraft>(
  {
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderEmail: {
      type: String,
      required: true,
    },
    // Support for multiple recipients
    recipients: {
      type: [recipientSchema],
      default: [],
    },
    // Legacy single recipient fields (for backward compatibility)
    recipientName: {
      type: String,
      default: '',
    },
    recipientEmail: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: '',
    },
    batch: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    eventName: {
      type: String,
      default: '',
    },
    eventDate: {
      type: String,
      default: '',
    },
    eventLocation: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Index for sorting by update date
draftSchema.index({ updatedAt: -1 });

const Draft = model<IDraft>('Draft', draftSchema);

export default Draft;
