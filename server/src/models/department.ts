import { Schema, model, type Document } from 'mongoose';

export interface IDepartment {
  stream: string;
  branch: string;
  deptCode: string;
  alumniCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type IDepartmentDocument = IDepartment & Document;

const departmentSchema = new Schema<IDepartment>({
  stream: {
    type: String,
    required: true,
    trim: true
  },
  branch: {
    type: String,
    required: true,
    trim: true,
  },
  deptCode: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    uppercase: true
  },
  alumniCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index for faster queries (deptCode already indexed via unique: true)
departmentSchema.index({ stream: 1, branch: 1 });

const Department = model<IDepartment>('Department', departmentSchema);

export default Department;
