import { Schema, model } from 'mongoose';

const feedbackSectionSchema = new Schema({
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

const feedbackSchema = new Schema({
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

const Feedback = model('Feedback', feedbackSchema);

export default Feedback;