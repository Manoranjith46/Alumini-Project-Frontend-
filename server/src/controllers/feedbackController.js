import { Readable } from 'stream';
import mongoose from 'mongoose';
import Feedback from '../models/feedback.js';
import { getGridFSBucket } from '../config/db.js';
import { findCoordinatorForUser } from '../utils/coordinatorResolver.js';

// Upload buffer to GridFS and return the file ID
const uploadToGridFS = (buffer, filename, mimetype) => {
  return new Promise((resolve, reject) => {
    const bucket = getGridFSBucket();
    const readStream = Readable.from(buffer);
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: mimetype,
    });

    readStream.pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => resolve(uploadStream.id));
  });
};

export const submitFeedback = async (req, res) => {
  try {
    const {
      reviewedBy,
      date,
      time,
      visionIV,
      missionIM,
      visionDV,
      missionDM,
      peos,
    } = req.body;

    // Parse JSON strings from FormData
    const parsedSections = {
      visionIV: JSON.parse(visionIV),
      missionIM: JSON.parse(missionIM),
      visionDV: JSON.parse(visionDV),
      missionDM: JSON.parse(missionDM),
      peos: JSON.parse(peos),
    };

    if (!reviewedBy || !date || !time || !req.file) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Upload signature image to GridFS
    const signatureId = await uploadToGridFS(
      req.file.buffer,
      `signature_${req.user._id}_${Date.now()}`,
      req.file.mimetype
    );

    const feedback = await Feedback.create({
      submittedBy: req.user._id,
      reviewedBy,
      date,
      time,
      ...parsedSections,
      signature: signatureId,
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMyFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ submittedBy: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, feedbacks });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('submittedBy', 'name email userId')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, feedbacks });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid feedback ID' });
    }

    const feedback = await Feedback.findById(id)
      .populate('submittedBy', 'name email userId');

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    res.status(200).json({ success: true, feedback });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getSignatureImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid image ID' });
    }

    const bucket = getGridFSBucket();
    const files = await bucket.find({ _id: new mongoose.Types.ObjectId(id) }).toArray();

    if (!files.length) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    res.set('Content-Type', files[0].contentType);
    res.set('Cache-Control', 'public, max-age=86400');
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(id));
    downloadStream.pipe(res);
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getDepartmentFeedbacks = async (req, res) => {
  try {
    // Get coordinator's department
    if (req.user?.role !== 'coordinator') {
      return getAllFeedbacks(req, res);
    }

    const coordinator = await findCoordinatorForUser(req.user);
    const department = coordinator?.department || '';

    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Coordinator department not found',
      });
    }

    // Normalize department name for case-insensitive comparison
    const normalizedDepartment = department.trim().toLowerCase();

    const feedbacks = await Feedback.find()
      .populate('submittedBy', 'name email userId')
      .sort({ createdAt: -1 });

    // Import Alumni model to check branch
    const { default: Alumni } = await import('../models/alumni.js');

    // Filter by coordinator's department
    const departmentFeedbacks = [];
    for (const feedback of feedbacks) {
      try {
        const alumni = await Alumni.findOne({
          email: feedback.submittedBy?.email?.toLowerCase(),
        }).select('branch');

        const normalizedBranch = (alumni?.branch || '').trim().toLowerCase();
        if (normalizedBranch === normalizedDepartment) {
          departmentFeedbacks.push(feedback);
        }
      } catch (err) {
        console.error('Error checking alumni for feedback:', err);
      }
    }

    res.status(200).json({
      success: true,
      feedbacks: departmentFeedbacks,
      total: departmentFeedbacks.length,
      department,
    });
  } catch (error) {
    console.error('Error fetching department feedbacks:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
