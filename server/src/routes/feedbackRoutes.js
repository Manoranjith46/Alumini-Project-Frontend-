import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { submitFeedback, getMyFeedbacks, getAllFeedbacks, getSignatureImage } from '../controllers/feedbackController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Alumni submits feedback (signature uploaded as file)
router.post('/', authenticate, upload.single('signature'), submitFeedback);

// Alumni gets their own feedbacks
router.get('/my', authenticate, getMyFeedbacks);

// Admin/Coordinator gets all feedbacks
router.get('/all', authenticate, getAllFeedbacks);

// Serve a signature image from GridFS
router.get('/image/:id', getSignatureImage);

export default router;
