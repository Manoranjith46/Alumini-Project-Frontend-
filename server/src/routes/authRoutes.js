import { Router } from 'express';
import { login, googleLogin } from '../controllers/authController.js';

const router = Router();

router.post('/login', login);
router.post('/google-login', googleLogin);

export default router;