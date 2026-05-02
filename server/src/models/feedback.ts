import { Schema, model, type Types, type Document } from 'mongoose';

export interface IFeedbackSection {
  rating: 'needs_improvement' | 'satisfied' | 'best';
  comment: string;
}

export interface IFeedback {
  submittedBy: Types.ObjectId;
  reviewedBy: string;
  date: Date;
  time: string;
  visionIV: IFeedbackSection;
  missionIM: IFeedbackSection;
  visionDV: IFeedbackSection;
  missionDM: IFeedbackSection;
  peos: IFeedbackSection;
  signature: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type IFeedbackDocument = IFeedback & Document;

const feedbackSectionSchema = new Schema<IFeedbackSection>({
  rating: {
    type: String,
    enum: ['needs_improvement', 'satisfied', 'best'],
    required: true,
  },
  comment: {
    type: String,
    trim: true,
    default: '',
  },
}, { _id: false });

const feedbackSchema = new Schema<IFeedback>({
  submittedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reviewedBy: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  visionIV: {
    type: feedbackSectionSchema,
    required: true,
  },
  missionIM: {
    type: feedbackSectionSchema,
    required: true,
  },
  visionDV: {
    type: feedbackSectionSchema,
    required: true,
  },
  missionDM: {
    type: feedbackSectionSchema,
    required: true,
  },
  peos: {
    type: feedbackSectionSchema,
    required: true,
  },
  signature: {
    type: Schema.Types.ObjectId,
    required: true,
  },
}, { timestamps: true });

const Feedback = model<IFeedback>('Feedback', feedbackSchema);

export default Feedback;
