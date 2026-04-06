import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { generateFlyer, getFlyerImage } from '../controllers/flyerController.js';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Generate flyer from template
router.post(
  '/generate',
  authenticate,
  upload.single('template'),
  generateFlyer
);

// Get flyer image from GridFS
router.get('/image/:id', getFlyerImage);

export default router;
