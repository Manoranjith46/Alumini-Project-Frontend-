import { Readable } from 'stream';
import mongoose from 'mongoose';
import type { Request, Response } from 'express';
import Invitation from '../models/invitation.js';
import { getGridFSBucket } from '../config/db.js';
import { findCoordinatorForUser } from '../utils/coordinatorResolver.js';

// Upload buffer to GridFS and return the file ID
const uploadToGridFS = (buffer: Buffer, filename: string, mimetype: string): Promise<mongoose.Types.ObjectId> => {
	return new Promise((resolve, reject) => {
		const bucket = getGridFSBucket();
		if (!bucket) return reject(new Error('GridFSBucket not initialized'));
		const readStream = Readable.from(buffer);
		const uploadStream = bucket.openUploadStream(filename, {
			contentType: mimetype,
		});

		readStream.pipe(uploadStream)
			.on('error', reject)
			.on('finish', () => resolve(uploadStream.id));
	});
};

export const createInvitation = async (req: Request, res: Response): Promise<void> => {
	try {
		const {
			sender,
			subject,
			eventDate,
			eventTime,
			venue,
			description,
		} = req.body;

		if (!sender || !subject || !eventDate || !eventTime || !venue || !description) {
			res.status(400).json({ success: false, message: 'All fields are required' });
			return;
		}

		if (!req.user) {
			res.status(401).json({ success: false, message: 'Unauthorized' });
			return;
		}

		let flyerId: mongoose.Types.ObjectId | null = null;
		if (req.file) {
			flyerId = await uploadToGridFS(
				req.file.buffer,
				`flyer_${req.user._id}_${Date.now()}`,
				req.file.mimetype
			);
		}

		const invitation = await Invitation.create({
			createdBy: req.user._id,
			sender,
			subject,
			eventDate,
			eventTime,
			venue,
			description,
			flyer: flyerId,
		});

		res.status(201).json({
			success: true,
			message: 'Invitation created successfully',
			invitation,
		});
	} catch (error: any) {
		if (error.name === 'ValidationError') {
			res.status(400).json({ success: false, message: error.message });
			return;
		}
		res.status(500).json({ success: false, message: 'Server error' });
	}
};

export const getAllInvitations = async (req: Request, res: Response): Promise<void> => {
	try {
		const invitations = await Invitation.find()
			.populate('createdBy', 'name email userId')
			.sort({ createdAt: -1 });
		res.status(200).json({ success: true, invitations });
	} catch {
		res.status(500).json({ success: false, message: 'Server error' });
	}
};

export const getInvitationById = async (req: Request, res: Response): Promise<void> => {
	try {
		const { id } = req.params;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			res.status(400).json({ success: false, message: 'Invalid invitation ID' });
			return;
		}

		const invitation = await Invitation.findById(id)
			.populate('createdBy', 'name email userId');

		if (!invitation) {
			res.status(404).json({ success: false, message: 'Invitation not found' });
			return;
		}

		res.status(200).json({ success: true, invitation });
	} catch {
		res.status(500).json({ success: false, message: 'Server error' });
	}
};

export const getFlyerImage = async (req: Request, res: Response): Promise<void> => {
	try {
		const { id } = req.params;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			res.status(400).json({ success: false, message: 'Invalid image ID' });
			return;
		}

		const bucket = getGridFSBucket();
		if (!bucket) {
			res.status(500).json({ success: false, message: 'GridFSBucket not initialized' });
			return;
		}

		const files = await bucket.find({ _id: new mongoose.Types.ObjectId(id) }).toArray();

		if (!files.length) {
			res.status(404).json({ success: false, message: 'Image not found' });
			return;
		}

		res.set('Content-Type', files[0].contentType);
		res.set('Cache-Control', 'public, max-age=86400');
		const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(id));
		downloadStream.pipe(res);
	} catch {
		res.status(500).json({ success: false, message: 'Server error' });
	}
};

export const getDepartmentInvitations = async (req: Request, res: Response): Promise<void> => {
	try {
		// Get coordinator's department
		if (req.user?.role !== 'coordinator') {
			await getAllInvitations(req, res);
			return;
		}

		const coordinator = await findCoordinatorForUser(req.user);
		const department = coordinator?.department || '';

		if (!department) {
			res.status(400).json({
				success: false,
				message: 'Coordinator department not found',
			});
			return;
		}

		// Normalize department name for case-insensitive comparison
		const normalizedDepartment = department.trim().toLowerCase();

		const invitations = await Invitation.find()
			.populate<{ createdBy: { _id: mongoose.Types.ObjectId } }>('createdBy', 'name email userId')
			.sort({ createdAt: -1 });

		// Import Coordinator model to check department
		const { default: Coordinator } = await import('../models/coordinator.js');

		// Filter by coordinator's department
		const departmentInvitations = [];
		for (const invitation of invitations) {
			try {
				if (!invitation.createdBy?._id) continue;

				const invCreator = await Coordinator.findOne({
					userId: invitation.createdBy._id,
				}).select('department');

				const normalizedCreatorDept = (invCreator?.department || '').trim().toLowerCase();
				if (normalizedCreatorDept === normalizedDepartment) {
					departmentInvitations.push(invitation);
				}
			} catch (err) {
				console.error('Error checking invitation creator department:', err);
			}
		}

		res.status(200).json({
			success: true,
			invitations: departmentInvitations,
			total: departmentInvitations.length,
			department,
		});
	} catch (error) {
		console.error('Error fetching department invitations:', error);
		res.status(500).json({ success: false, message: 'Server error' });
	}
};
