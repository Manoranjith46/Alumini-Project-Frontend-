import mongoose from 'mongoose';
import { getGridFSBucket } from '../config/db.js';
import Flyer from '../models/flyer.js';

const normalizeRequestData = (body = {}) => {
  return {
    eventName: String(body.eventName || '').trim(),
    subtitle: String(body.subtitle || body.eventDescription || '').trim(),
    eventDate: String(body.eventDate || body.date || '').trim(),
    venue: String(body.venue || '').trim(),
    guestName: String(body.guestName || '').trim(),
    theme: String(body.theme || body.hostedBy || '').trim(),
    templateName: String(body.templateName || 'modern_event').trim(),
    logoUrl: String(body.logoUrl || body.logo || '').trim(),
    guestPhotoUrl: String(body.guestPhotoUrl || body.guestImage || '').trim(),
    backgroundUrl: String(body.backgroundUrl || body.banner || body.background || '').trim(),
  };
};

const extractFileSummary = (files = {}) => ({
  guestPhoto: Boolean(files.guestPhoto?.[0]),
  logo: Boolean(files.logo?.[0]),
  background: Boolean(files.background?.[0] || files.banner?.[0] || files.template?.[0]),
});

export const generateFlyer = async (req, res) => {
  try {
    const flyerData = normalizeRequestData(req.body);
    const fileSummary = extractFileSummary(req.files || {});

    if (!flyerData.eventName) {
      return res.status(400).json({ success: false, message: 'Event name is required' });
    }

    if (!flyerData.eventDate) {
      return res.status(400).json({ success: false, message: 'Event date is required' });
    }

    if (!flyerData.venue) {
      return res.status(400).json({ success: false, message: 'Venue is required' });
    }

    const flyer = new Flyer({
      eventName: flyerData.eventName,
      guestName: flyerData.guestName,
      guestImage: flyerData.guestPhotoUrl || '',
      date: flyerData.eventDate,
      venue: flyerData.venue,
      hostedBy: flyerData.theme,
      tagline: flyerData.subtitle,
      eventDescription: flyerData.subtitle,
      templateImageId: '',
      generatedImageId: '',
      geminiPrompt: `placeholder:${flyerData.templateName}`,
      createdBy: req.user._id,
    });

    const savedFlyer = await flyer.save();

    return res.status(202).json({
      success: true,
      message: 'AI will be Integrated soon',
      data: {
        flyerId: savedFlyer._id.toString(),
        templateName: flyerData.templateName,
        receivedAt: new Date().toISOString(),
        receivedDetails: {
          eventName: flyerData.eventName,
          subtitle: flyerData.subtitle,
          eventDate: flyerData.eventDate,
          venue: flyerData.venue,
          guestName: flyerData.guestName,
          theme: flyerData.theme,
          hasGuestPhoto: fileSummary.guestPhoto || Boolean(flyerData.guestPhotoUrl),
          hasLogo: fileSummary.logo || Boolean(flyerData.logoUrl),
          hasBackground: fileSummary.background || Boolean(flyerData.backgroundUrl),
        },
      },
    });
  } catch (error) {
    console.error('[Flyer] Placeholder flow error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to receive flyer details',
      error: error.message || 'Unknown error',
    });
  }
};

export const getFlyerImage = async (req, res) => {
  try {
    const { id: fileId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file ID format',
      });
    }

    const bucket = getGridFSBucket();
    if (!bucket) {
      return res.status(500).json({
        success: false,
        message: 'Database storage service not initialized',
      });
    }

    const objectId = new mongoose.Types.ObjectId(fileId);
    const files = await bucket.find({ _id: objectId }).toArray();

    if (!files.length) {
      return res.status(404).json({
        success: false,
        message: 'Flyer image not found',
      });
    }

    const file = files[0];
    res.set('Content-Type', file.contentType || 'image/png');
    res.set('Cache-Control', 'public, max-age=31536000');
    res.set('Content-Disposition', `inline; filename="${file.filename}"`);

    const downloadStream = bucket.openDownloadStream(objectId);
    downloadStream.on('error', (error) => {
      console.error('[GridFS] Download stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error streaming image',
        });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('[Flyer] Get image error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve flyer image',
      error: error.message,
    });
  }
};
