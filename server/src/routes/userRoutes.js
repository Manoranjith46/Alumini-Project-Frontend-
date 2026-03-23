import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAllUsers, getUsersByRole, getUserById, updateUser, deleteUser } from '../controllers/userController.js';

const router = Router();

// Get all users (Admin only)
router.get('/', authenticate, getAllUsers);

// Get users by role (e.g., alumni, admin, coordinator)
router.get('/:role', authenticate, getUsersByRole);

// Get single user by ID
router.get('/:id', authenticate, getUserById);

// Update user
router.put('/:id', authenticate, updateUser);

// Delete user
router.delete('/:id', authenticate, deleteUser);

export default router;