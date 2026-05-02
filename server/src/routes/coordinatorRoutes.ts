import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
	createCoordinator,
	getAllCoordinators,
	getCoordinatorById,
	getMyProfile,
	updateMyProfile,
	updateCoordinatorPassword,
	sendCoordinatorResetOtp,
	verifyCoordinatorResetOtp,
	resetCoordinatorPassword,
	updateCoordinator,
	deleteCoordinator,
	getCoordinatorsByDepartment,
} from '../controllers/coordinatorController.js';

const router = Router();

// Create new coordinator
router.post('/', authenticate, createCoordinator);

// Get coordinator's own profile
router.get('/profile/me', authenticate, getMyProfile);

// Get all coordinators (with optional filters)
router.get('/all', authenticate, getAllCoordinators);

// Get coordinators by department
router.get('/department/:department', authenticate, getCoordinatorsByDepartment);

// Get single coordinator by ID
router.get('/:id', authenticate, getCoordinatorById);

// Update coordinator's own profile
router.put('/profile/me', authenticate, updateMyProfile);
router.put('/profile/password', authenticate, updateCoordinatorPassword);
router.post('/profile/send-otp', authenticate, sendCoordinatorResetOtp);
router.post('/profile/verify-otp', authenticate, verifyCoordinatorResetOtp);
router.post('/profile/reset-password', authenticate, resetCoordinatorPassword);

// Update coordinator
router.put('/:id', authenticate, updateCoordinator);

// Delete coordinator
router.delete('/:id', authenticate, deleteCoordinator);

export default router;
