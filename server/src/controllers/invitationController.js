import { Readable } from 'stream';
import Invitation from '../models/invitation.js';
import { getGridFSBucket } from '../config/db.js';

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

export const createInvitation = async (req, res) => {
  try {
    const { eventName, alumniName, date, time, location } = req.body;

    if (!eventName || !date || !time || !req.file) {
      return res.status(400).json({ success: false, message: 'Event name, date, time and flyer are required' });
    }

    // Upload flyer image to GridFS
    const flyerId = await uploadToGridFS(
      req.file.buffer,
      `flyer_${req.user._id}_${Date.now()}.png`,
      req.file.mimetype
    );

    const invitation = await Invitation.create({
      createdBy: req.user._id,
      eventName,
      alumniName,
      date,
      time,
      location,
      flyer: flyerId,
    });

    res.status(201).json({
      success: true,
      message: 'Invitation created successfully',
      invitation,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Invitation creation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find()
      .populate('createdBy', 'name email userId')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, invitations });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getFlyerImage = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = await import('mongoose');
    if (!mongoose.default.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid image ID' });
    }

    const bucket = getGridFSBucket();
    const downloadStream = bucket.openDownloadStream(new mongoose.default.Types.ObjectId(id));

    downloadStream.on('error', () => {
      res.status(404).json({ success: false, message: 'Image not found' });
    });

    res.set('Content-Type', 'image/png');
    downloadStream.pipe(res);
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
