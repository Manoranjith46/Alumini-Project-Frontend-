import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { createFaculty, getAllFaculty, getFacultyById, updateFaculty, deleteFaculty, getFacultyByDepartment } from '../controllers/facultyController.js';

const router = Router();

// Create new faculty
router.post('/', authenticate, createFaculty);

// Get all faculty (with optional filters)
router.get('/all', authenticate, getAllFaculty);

// Get faculty by department
router.get('/department/:department', authenticate, getFacultyByDepartment);

// Get single faculty by ID
router.get('/:id', authenticate, getFacultyById);

// Update faculty
router.put('/:id', authenticate, updateFaculty);

// Delete faculty
router.delete('/:id', authenticate, deleteFaculty);

export default router;
