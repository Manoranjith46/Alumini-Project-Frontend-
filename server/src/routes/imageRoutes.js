import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import {
	uploadImage,
	getImage,
	deleteImage,
} from '../controllers/imageController.js';

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

// Upload image
router.post('/upload', authenticate, upload.single('image'), uploadImage);

// Get image by ID
router.get('/:id', getImage);

// Delete image by ID
router.delete('/:id', authenticate, deleteImage);

export default router;
