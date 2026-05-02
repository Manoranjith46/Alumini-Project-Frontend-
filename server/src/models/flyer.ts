import { Schema, model, type Types, type Document } from 'mongoose';

export interface IFlyer {
  eventName: string;
  guestName: string;
  guestImage: string;
  date: string;
  venue: string;
  hostedBy: string;
  tagline: string;
  eventDescription: string;
  templateImageId: string;
  generatedImageId: string;
  geminiPrompt: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type IFlyerDocument = IFlyer & Document;

const flyerSchema = new Schema<IFlyer>(
  {
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    guestName: {
      type: String,
      required: true,
      trim: true,
    },
    guestImage: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: String,
      default: '',
    },
    venue: {
      type: String,
      default: '',
      trim: true,
    },
    hostedBy: {
      type: String,
      default: '',
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
      trim: true,
    },
    eventDescription: {
      type: String,
      default: '',
      trim: true,
    },
    templateImageId: {
      type: String,
      required: true,
    },
    generatedImageId: {
      type: String,
      required: true,
    },
    geminiPrompt: {
      type: String,
      default: '',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default model<IFlyer>('Flyer', flyerSchema);
