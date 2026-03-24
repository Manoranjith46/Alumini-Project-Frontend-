import { Schema, model } from 'mongoose';

const alumniSchema = new Schema(
	{
		// Reference to User collection for authentication
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		registerNumber: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			validate: {
				validator: function (v) {
					return /^\d{11}$/.test(v);
				},
				message: 'Register number must be exactly 11 digits',
			},
		},
		// Personal Details
		name: {
			type: String,
			required: true,
			trim: true,
			maxlength: 200,
		},
		fatherName: {
			type: String,
			trim: true,
			maxlength: 200,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},
		dob: {
			type: Date,
			required: true,
		},
		// Study Details
		yearFrom: {
			type: Number,
			required: true,
		},
		yearTo: {
			type: Number,
			required: true,
		},
		degree: {
			type: String,
			required: true,
			trim: true,
		},
		branch: {
			type: String,
			required: true,
			trim: true,
		},
		// Addresses
		presentAddress: {
			street: { type: String, trim: true },
			city: { type: String, trim: true },
			pinCode: { type: String, trim: true },
			mobile: { type: String, trim: true },
		},
		permanentAddress: {
			street: { type: String, trim: true },
			city: { type: String, trim: true },
			pinCode: { type: String, trim: true },
			mobile: { type: String, trim: true },
		},
		// Competitive Exams
		hasCompetitiveExams: {
			type: Boolean,
			default: false,
		},
		competitiveExams: [
			{
				examName: { type: String, trim: true },
				marks: { type: String, trim: true },
			},
		],
		// College Qualifications
		collegeQualifications: [
			{
				course: { type: String, trim: true },
				institution: { type: String, trim: true },
				yearOfPassing: { type: String, trim: true },
				percentage: { type: String, trim: true },
				boardUniversity: { type: String, trim: true },
			},
		],
		// Employment Details
		placementType: {
			type: String,
			enum: ['On-campus', 'Off-campus', 'Others', 'To be employed', ''],
			default: '',
		},
		designation: {
			type: String,
			trim: true,
		},
		companyAddress: {
			type: String,
			trim: true,
		},
		employmentRemarks: {
			type: String,
			trim: true,
		},
		// Entrepreneur Details
		isEntrepreneur: {
			type: Boolean,
			default: false,
		},
		entrepreneurDetails: {
			organizationName: { type: String, trim: true },
			natureOfWork: { type: String, trim: true },
			annualTurnover: { type: String, trim: true },
			numberOfEmployees: { type: String, trim: true },
		},
		// Marital Status
		maritalStatus: {
			type: String,
			enum: ['Single', 'Married', ''],
			default: '',
		},
		spouseDetails: {
			name: { type: String, trim: true },
			qualification: { type: String, trim: true },
			numberOfChildren: { type: String, trim: true },
		},
		// Additional Info
		extraCurricular: {
			type: String,
			trim: true,
		},
		otherInfo: {
			type: String,
			trim: true,
		},
		// Known Alumni
		knownAlumni: [
			{
				name: { type: String, trim: true },
				degree: { type: String, trim: true },
				batch: { type: String, trim: true },
				email: { type: String, trim: true },
				phone: { type: String, trim: true },
			},
		],
		// Signature (GridFS file ID or legacy base64)
		signature: {
			type: String,
			default: null,
		},
		// Profile Photo (GridFS file ID or legacy base64)
		profilePhoto: {
			type: String,
			default: null,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

// Indexes for faster queries
// Note: registerNumber already has unique index from schema definition
alumniSchema.index({ email: 1 });
alumniSchema.index({ branch: 1 });
alumniSchema.index({ yearFrom: 1, yearTo: 1 });

const Alumni = model('Alumni', alumniSchema, 'alumni');

export default Alumni;
