import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGridFSBucket } from '../config/db.js';
import Flyer from '../models/flyer.js';

// ============================================================
// GOOGLE GEMINI API INITIALIZATION
// Get your API key from: https://aistudio.google.com/apikey
// ============================================================
let genAI = null;
let geminiModel = null;
let lastModelName = null;

// Model to use for image generation - can be changed if one doesn't work
const IMAGE_GEN_MODEL = 'gemini-2.0-flash-exp';

/**
 * Initialize Google Gemini AI with lazy loading
 * Uses gemini-2.0-flash-exp for image generation capabilities
 */
const initGemini = () => {
  // Reset if model changed
  if (geminiModel && lastModelName === IMAGE_GEN_MODEL) return geminiModel;

  // Check for API key in environment
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable');
  }

  // Initialize Google Generative AI client
  genAI = new GoogleGenerativeAI(apiKey);

  // Get the model for image generation
  // Using gemini-2.0-flash-exp for native image output
  geminiModel = genAI.getGenerativeModel({
    model: IMAGE_GEN_MODEL
  });
  lastModelName = IMAGE_GEN_MODEL;

  console.log(`Google Gemini AI initialized successfully with model: ${IMAGE_GEN_MODEL}`);
  return geminiModel;
};

// ============================================================
// HELPER: Save image buffer to GridFS
// Uploads a buffer directly to GridFS without saving to disk
// ============================================================
const saveToGridFS = (bucket, buffer, filename, mimeType, metadata = {}) => {
  return new Promise((resolve, reject) => {
    // Open an upload stream to GridFS
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: mimeType,
      metadata: {
        ...metadata,
        uploadedAt: new Date().toISOString()
      },
    });

    // Handle successful upload
    uploadStream.on('finish', () => {
      console.log(`[GridFS] File uploaded: ${filename}, ID: ${uploadStream.id}`);
      resolve(uploadStream.id);
    });

    // Handle upload errors
    uploadStream.on('error', (error) => {
      console.error(`[GridFS] Upload error for ${filename}:`, error);
      reject(error);
    });

    // Write buffer to stream and close
    uploadStream.end(buffer);
  });
};

// ============================================================
// HELPER: Read file from GridFS as buffer
// Reads a file from GridFS and returns it as a Buffer
// ============================================================
const readFromGridFS = (bucket, fileId) => {
  return new Promise((resolve, reject) => {
    const chunks = [];

    // Convert string ID to ObjectId if needed
    const objectId = typeof fileId === 'string'
      ? new mongoose.Types.ObjectId(fileId)
      : fileId;

    // Open download stream from GridFS
    const downloadStream = bucket.openDownloadStream(objectId);

    // Collect chunks
    downloadStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    // Combine chunks into buffer on completion
    downloadStream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      console.log(`[GridFS] File read complete, size: ${buffer.length} bytes`);
      resolve(buffer);
    });

    // Handle errors
    downloadStream.on('error', (error) => {
      console.error(`[GridFS] Read error for ${fileId}:`, error);
      reject(error);
    });
  });
};

// ============================================================
// HELPER: Build the flyer generation prompt
// Creates a detailed prompt for Gemini to generate the flyer
// ============================================================
const buildFlyerPrompt = (event, guest) => {
  return `You are a professional flyer designer.
I am giving you a JPEG flyer template as reference.
Redesign it by placing the following event and guest details
clearly and professionally on the flyer.

Event Name: ${event.name || 'Event'} — largest, boldest text on the flyer
Date: ${event.date || 'TBA'} | Time: ${event.time || 'TBA'}
Venue: ${event.venue || 'TBA'}
About: ${event.description || ''}

Featured Guest: ${guest.name || 'Guest Speaker'}
Role: ${guest.role || ''}, ${guest.company || ''}

Design Rules:
- Preserve original template layout, colors, and background
- Place all text in appropriate zones matching the template
- Use sharp, readable, professional typography
- Do not add elements not present in the original template
- Output a high-quality flyer image`;
};

// ============================================================
// MAIN CONTROLLER: Generate Flyer using Google Gemini API
// POST /api/flyers/generate
// Content-Type: multipart/form-data
// ============================================================
export const generateFlyer = async (req, res) => {
  const startTime = Date.now();

  try {
    // --------------------------------------------------------
    // STEP 1: Parse form data
    // Receive multipart form — parse event and guest from JSON strings
    // --------------------------------------------------------
    const { eventName, guestName, guestImage, date, venue, hostedBy, organizer, eventDescription } = req.body;

    // Initialize event and guest objects
    let event = {};
    let guest = {};

    // Parse event JSON string if provided
    if (req.body.event) {
      try {
        event = typeof req.body.event === 'string' ? JSON.parse(req.body.event) : req.body.event;
      } catch (e) {
        console.warn('[Parse] Failed to parse event JSON:', e.message);
      }
    }

    // Parse guest JSON string if provided
    if (req.body.guest) {
      try {
        guest = typeof req.body.guest === 'string' ? JSON.parse(req.body.guest) : req.body.guest;
      } catch (e) {
        console.warn('[Parse] Failed to parse guest JSON:', e.message);
      }
    }

    // Merge individual fields with parsed JSON (individual fields take priority)
    event = {
      name: eventName || event.name || '',
      date: date || event.date || '',
      time: event.time || '',
      venue: venue || event.venue || '',
      description: eventDescription || event.description || ''
    };

    guest = {
      name: guestName || guest.name || '',
      role: guest.role || '',
      company: hostedBy || organizer || guest.company || '',
      image: guestImage || guest.image || ''
    };

    // --------------------------------------------------------
    // STEP 2: Validate required fields
    // Return 400 if missing fields or non-JPEG file
    // --------------------------------------------------------
    if (!event.name || !event.name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Event name is required',
      });
    }

    if (!guest.name || !guest.name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Guest name is required',
      });
    }

    // Validate template file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Template image file (JPEG) is required',
      });
    }

    // Validate file is JPEG (preferred) or acceptable image format
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Only JPEG or PNG image files are allowed. JPEG is recommended.',
      });
    }

    // --------------------------------------------------------
    // STEP 3: Get GridFS bucket
    // Using existing GridFS bucket for both templates and flyers
    // --------------------------------------------------------
    const bucket = getGridFSBucket();
    if (!bucket) {
      return res.status(500).json({
        success: false,
        message: 'Database storage service (GridFS) not initialized',
      });
    }

    // --------------------------------------------------------
    // STEP 4: Upload JPEG template directly to GridFS
    // Save to "templates" collection without saving to disk
    // --------------------------------------------------------
    console.log('[GridFS] Uploading template to GridFS...');
    const templateFilename = `template_${req.user._id}_${Date.now()}.${req.file.mimetype.split('/')[1]}`;
    const templateFileId = await saveToGridFS(
      bucket,
      req.file.buffer,
      templateFilename,
      req.file.mimetype,
      {
        userId: req.user._id,
        type: 'flyer_template',
        originalName: req.file.originalname,
        eventName: event.name,
        guestName: guest.name
      }
    );
    console.log('[GridFS] Template uploaded with ID:', templateFileId);

    // --------------------------------------------------------
    // STEP 5: Convert template buffer to base64 string
    // Gemini API requires base64 encoded image data
    // --------------------------------------------------------
    console.log('[Gemini] Converting template to base64...');
    const templateBase64 = req.file.buffer.toString('base64');
    console.log('[Gemini] Base64 size:', Math.round(templateBase64.length / 1024), 'KB');

    // --------------------------------------------------------
    // STEP 6: Build the AI prompt
    // --------------------------------------------------------
    const prompt = buildFlyerPrompt(event, guest);
    console.log('[Gemini] Prompt built:', prompt.substring(0, 150) + '...');

    // --------------------------------------------------------
    // STEP 7: Initialize Gemini and call API
    // Send base64 JPEG + prompt to generate flyer
    // --------------------------------------------------------
    let generatedImageBase64 = null;
    let generatedMimeType = 'image/png';

    try {
      // Initialize Gemini model
      const model = initGemini();
      console.log('[Gemini] Calling Gemini API for flyer generation...');

      // Call Gemini API with image and prompt
      // Using the multimodal content format
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            // Part 1: The template image as inline data
            {
              inlineData: {
                mimeType: req.file.mimetype,
                data: templateBase64
              }
            },
            // Part 2: The text prompt
            {
              text: prompt
            }
          ]
        }],
        // Request image output in the response
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT']
        }
      });

      console.log('[Gemini] Response received from API');

      // --------------------------------------------------------
      // STEP 8: Extract base64 PNG from Gemini response
      // Look for image data in the response parts
      // --------------------------------------------------------
      const candidates = result.response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error('No candidates in Gemini response');
      }

      const content = candidates[0].content;
      if (!content || !content.parts) {
        throw new Error('No content parts in Gemini response');
      }

      // Find the image part in the response
      for (const part of content.parts) {
        if (part.inlineData) {
          // This is the generated flyer image
          generatedImageBase64 = part.inlineData.data;
          generatedMimeType = part.inlineData.mimeType || 'image/png';
          console.log('[Gemini] Generated image extracted, mime:', generatedMimeType);
          break;
        }
      }

      if (!generatedImageBase64) {
        throw new Error('No image data found in Gemini response');
      }

    } catch (aiError) {
      // --------------------------------------------------------
      // Return 502 Bad Gateway for Gemini API errors
      // --------------------------------------------------------
      console.error('[Gemini] API Error:', aiError);
      console.error('[Gemini] Error details:', JSON.stringify(aiError, Object.getOwnPropertyNames(aiError), 2));
      return res.status(502).json({
        success: false,
        message: 'AI service failed to generate flyer',
        error: aiError.message || 'Gemini API call failed',
        details: aiError.errorDetails || aiError.cause || null
      });
    }

    // --------------------------------------------------------
    // STEP 9: Convert generated base64 PNG to buffer
    // --------------------------------------------------------
    console.log('[GridFS] Converting generated image to buffer...');
    const generatedBuffer = Buffer.from(generatedImageBase64, 'base64');
    console.log('[GridFS] Generated image buffer size:', generatedBuffer.length, 'bytes');

    // --------------------------------------------------------
    // STEP 10: Upload generated flyer buffer to GridFS
    // Save to "flyers" collection with metadata
    // --------------------------------------------------------
    console.log('[GridFS] Uploading generated flyer to GridFS...');
    const flyerFilename = `flyer_${req.user._id}_${Date.now()}.png`;
    const flyerFileId = await saveToGridFS(
      bucket,
      generatedBuffer,
      flyerFilename,
      generatedMimeType,
      {
        userId: req.user._id,
        type: 'flyer_generated',
        eventName: event.name,
        guestName: guest.name,
        templateFileId: templateFileId.toString(),
        generatedAt: new Date().toISOString()
      }
    );
    console.log('[GridFS] Generated flyer uploaded with ID:', flyerFileId);

    // --------------------------------------------------------
    // STEP 11: Save flyer record to database
    // --------------------------------------------------------
    const flyer = new Flyer({
      eventName: event.name.trim(),
      guestName: guest.name.trim(),
      guestImage: guest.image || '',
      date: event.date || '',
      venue: event.venue || '',
      hostedBy: guest.company || '',
      tagline: organizer || '',
      eventDescription: event.description || '',
      templateImageId: templateFileId.toString(),
      generatedImageId: flyerFileId.toString(),
      geminiPrompt: prompt,
      createdBy: req.user._id,
    });

    const savedFlyer = await flyer.save();
    const generationTime = Date.now() - startTime;
    console.log(`[Flyer] Record saved to DB, ID: ${savedFlyer._id}, Generation time: ${generationTime}ms`);

    // --------------------------------------------------------
    // STEP 12: Return JSON response with flyer GridFS file ID
    // --------------------------------------------------------
    return res.status(201).json({
      success: true,
      data: {
        flyerFileId: flyerFileId.toString(),
        templateFileId: templateFileId.toString(),
        generatedAt: new Date().toISOString(),
        retrieveUrl: `/api/flyers/image/${flyerFileId}`,
        flyerId: savedFlyer._id,
        generationTimeMs: generationTime
      },
      flyer: {
        imageBase64: `data:${generatedMimeType};base64,${generatedImageBase64}`,
        prompt: prompt,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    // --------------------------------------------------------
    // Return 500 for all other errors
    // --------------------------------------------------------
    console.error('[Flyer] Generation Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate flyer',
      error: error.message || 'Unknown error',
    });
  }
};

// ============================================================
// GET FLYER IMAGE: Stream flyer from GridFS
// GET /api/flyers/image/:fileId
// ============================================================
export const getFlyerImage = async (req, res) => {
  try {
    const { id: fileId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file ID format',
      });
    }

    // Get GridFS bucket
    const bucket = getGridFSBucket();
    if (!bucket) {
      return res.status(500).json({
        success: false,
        message: 'Database storage service not initialized',
      });
    }

    const objectId = new mongoose.Types.ObjectId(fileId);

    // Check if file exists in GridFS
    const files = await bucket.find({ _id: objectId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Flyer image not found',
      });
    }

    const file = files[0];

    // Set response headers
    res.set('Content-Type', file.contentType || 'image/png');
    res.set('Cache-Control', 'public, max-age=31536000');
    res.set('Content-Disposition', `inline; filename="${file.filename}"`);

    // Stream file from GridFS to response
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

    // Pipe GridFS stream directly to response
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
