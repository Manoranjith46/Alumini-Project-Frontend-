import mongoose, { type Types, type Document, type Model, type HydratedDocument } from 'mongoose';

const { Schema } = mongoose;

export interface IBatchYear {
  startYear?: number;
  endYear?: number;
}

export interface IResponseData {
  fullName?: string;
  designation?: string;
  companyName?: string;
  mobileNo?: string;
  personalEmail?: string;
  officialEmail?: string;
  location?: string;
  batchYear?: IBatchYear;
  rejectionReason?: string;
}

export interface IMailResponse {
  mailId: Types.ObjectId;
  tokenId: Types.ObjectId;
  recipientEmail: string;
  action: 'accept' | 'reject';
  responseData?: IResponseData;
  submittedAt: Date;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMailResponseMethods {
  getFormattedResponse(): Record<string, unknown>;
}

export interface IMailResponseModel extends Model<IMailResponse, object, IMailResponseMethods> {
  getResponsesForMail(mailId: string | Types.ObjectId): mongoose.Query<IMailResponseDocument[], IMailResponseDocument>;
  getMailStats(mailId: string): Promise<{ total: number; accepted: number; rejected: number; acceptanceRate: number }>;
  createResponse(responseData: Partial<IMailResponse>): Promise<IMailResponseDocument>;
}

export type IMailResponseDocument = HydratedDocument<IMailResponse, IMailResponseMethods>;

const mailResponseSchema = new Schema<IMailResponse, IMailResponseModel, IMailResponseMethods>({
  mailId: { type: Schema.Types.ObjectId, ref: 'Mail', required: true, index: true },
  tokenId: { type: Schema.Types.ObjectId, ref: 'MailToken', required: true, index: true },
  recipientEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
  action: { type: String, enum: ['accept', 'reject'], required: true },
  responseData: {
    fullName: { type: String, trim: true },
    designation: { type: String, trim: true },
    companyName: { type: String, trim: true },
    mobileNo: { type: String, trim: true },
    personalEmail: { type: String, lowercase: true, trim: true },
    officialEmail: { type: String, lowercase: true, trim: true },
    location: { type: String, trim: true },
    batchYear: {
      startYear: { type: Number, min: 2000, max: 2100 },
      endYear: { type: Number, min: 2000, max: 2100 }
    },
    rejectionReason: { type: String, trim: true }
  },
  submittedAt: { type: Date, default: Date.now, index: true },
  userAgent: { type: String },
  ipAddress: { type: String }
}, { timestamps: true });

mailResponseSchema.index({ mailId: 1, recipientEmail: 1 });
mailResponseSchema.index({ action: 1, submittedAt: -1 });
mailResponseSchema.index({ recipientEmail: 1, submittedAt: -1 });

mailResponseSchema.methods.getFormattedResponse = function(this: IMailResponseDocument) {
  const response: Record<string, unknown> = {
    id: this._id, mailId: this.mailId, recipientEmail: this.recipientEmail,
    action: this.action, submittedAt: this.submittedAt
  };
  if (this.action === 'accept' && this.responseData) {
    response.alumniInfo = {
      fullName: this.responseData.fullName, designation: this.responseData.designation,
      companyName: this.responseData.companyName,
      contactInfo: { mobile: this.responseData.mobileNo, personalEmail: this.responseData.personalEmail,
        officialEmail: this.responseData.officialEmail, location: this.responseData.location },
      batch: this.responseData.batchYear
    };
  } else if (this.action === 'reject' && this.responseData?.rejectionReason) {
    response.rejectionReason = this.responseData.rejectionReason;
  }
  return response;
};

mailResponseSchema.statics.getResponsesForMail = function(mailId: string | Types.ObjectId) {
  return this.find({ mailId })
    .populate('mailId', 'title content senderId senderName')
    .populate('tokenId', 'token createdAt')
    .sort({ submittedAt: -1 });
};

mailResponseSchema.statics.getMailStats = async function(mailId: string) {
  const responses = await this.aggregate([
    { $match: { mailId: new mongoose.Types.ObjectId(mailId) } },
    { $group: { _id: '$action', count: { $sum: 1 } } }
  ]);
  const stats = { total: 0, accepted: 0, rejected: 0, acceptanceRate: 0 };
  responses.forEach((response: { _id: string; count: number }) => {
    stats.total += response.count;
    if (response._id === 'accept') stats.accepted = response.count;
    else if (response._id === 'reject') stats.rejected = response.count;
  });
  if (stats.total > 0) stats.acceptanceRate = Math.round((stats.accepted / stats.total) * 100);
  return stats;
};

mailResponseSchema.statics.createResponse = function(responseData: Partial<IMailResponse>) {
  if (responseData.action === 'accept') {
    const requiredFields = ['fullName', 'mobileNo', 'personalEmail'] as const;
    const missingFields = requiredFields.filter(field =>
      !responseData.responseData || !responseData.responseData[field]
    );
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields for accept response: ${missingFields.join(', ')}`);
    }
  }
  return this.create(responseData);
};

const MailResponse = mongoose.model<IMailResponse, IMailResponseModel>('MailResponse', mailResponseSchema);

export default MailResponse;
