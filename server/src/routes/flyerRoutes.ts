import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { generateFlyer, getFlyerImage } from '../controllers/flyerController.js';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }

    cb(new Error('Only image files are allowed') as any, false);
  },
});

const flyerUploads = upload.fields([
  { name: 'guestPhoto', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
  { name: 'background', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'template', maxCount: 1 },
]);

router.post('/generate', authenticate, flyerUploads, generateFlyer);
router.post('/generate-flyer', authenticate, flyerUploads, generateFlyer);
router.get('/image/:id', getFlyerImage);

export default router;
