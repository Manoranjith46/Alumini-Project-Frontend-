import { Router } from 'express';
import { generateFlyer, enhanceText } from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/generate-flyer', authenticate, generateFlyer);
router.post('/enhance-text', authenticate, enhanceText);

export default router;
