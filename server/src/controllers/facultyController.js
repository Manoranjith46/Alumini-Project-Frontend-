import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import Faculty from '../models/faculty.js';

// Create a new faculty (creates both User and Faculty records)
export const createFaculty = async (req, res) => {
	try {
		const {
			userId,
			name,
			email,
			password,
			staffId,
			designation,
			department,
			phone,
			location,
			status,
			joinDate,
			personalInfo,
			education,
			experience,
			publications,
			patents,
		} = req.body;

		// Validate required fields
		if (!userId || !name || !email || !password || !staffId || !designation || !department || !joinDate) {
			return res.status(400).json({
				success: false,
				message: 'Required fields are missing (userId, name, email, password, staffId, designation, department, joinDate)'
			});
		}

		// Check if user with email or userId already exists
		const existingUser = await User.findOne({
			$or: [{ email }, { userId }]
		});
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: 'User with this email or userId already exists'
			});
		}

		// Check if faculty with staffId already exists
		const existingFaculty = await Faculty.findOne({ staffId });
		if (existingFaculty) {
			return res.status(400).json({
				success: false,
				message: 'Faculty with this Staff ID already exists'
			});
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create User account for authentication
		const newUser = await User.create({
			userId,
			name,
			email,
			password: hashedPassword,
			role: 'faculty',
		});

		// Create Faculty record with detailed information
		const faculty = await Faculty.create({
			userId: newUser._id,
			staffId,
			name,
			designation,
			department,
			email,
			phone,
			location,
			status,
			joinDate,
			personalInfo,
			education,
			experience,
			publications,
			patents,
		});

		// Populate the faculty with user details for response
		const populatedFaculty = await Faculty.findById(faculty._id)
			.populate('userId', 'userId name email role');

		res.status(201).json({
			success: true,
			message: 'Faculty created successfully',
			faculty: populatedFaculty,
		});
	} catch (error) {
		if (error.name === 'ValidationError') {
			return res.status(400).json({
				success: false,
				message: error.message
			});
		}
		console.error('Error creating faculty:', error);
		res.status(500).json({
			success: false,
			message: 'Server error'
		});
	}
};

// Get all faculty
export const getAllFaculty = async (req, res) => {
	try {
		const { department, status } = req.query;
		const filter = { isActive: true };

		if (department) filter.department = department;
		if (status) filter.status = status;

		const faculty = await Faculty.find(filter)
			.populate('userId', 'userId name email role')
			.sort({ name: 1 });

		res.status(200).json({ success: true, faculty });
	} catch {
		res.status(500).json({ success: false, message: 'Server error' });
	}
};

// Get faculty by department
export const getFacultyByDepartment = async (req, res) => {
	try {
		const { department } = req.params;

		const faculty = await Faculty.find({
			department: department.toUpperCase(),
			isActive: true
		})
		.populate('userId', 'userId name email role')
		.sort({ name: 1 });

		res.status(200).json({ success: true, faculty });
	} catch {
		res.status(500).json({ success: false, message: 'Server error' });
	}
};

// Get faculty by ID
export const getFacultyById = async (req, res) => {
	try {
		const { id } = req.params;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ success: false, message: 'Invalid faculty ID' });
		}

		const faculty = await Faculty.findOne({ _id: id, isActive: true })
			.populate('userId', 'userId name email role');

		if (!faculty) {
			return res.status(404).json({ success: false, message: 'Faculty not found' });
		}

		res.status(200).json({ success: true, faculty });
	} catch {
		res.status(500).json({ success: false, message: 'Server error' });
	}
};

// Update faculty
export const updateFaculty = async (req, res) => {
	try {
		const { id } = req.params;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ success: false, message: 'Invalid faculty ID' });
		}

		const faculty = await Faculty.findByIdAndUpdate(id, req.body, {
			new: true,
			runValidators: true,
		}).populate('userId', 'userId name email role');

		if (!faculty) {
			return res.status(404).json({ success: false, message: 'Faculty not found' });
		}

		res.status(200).json({
			success: true,
			message: 'Faculty updated successfully',
			faculty,
		});
	} catch (error) {
		if (error.name === 'ValidationError') {
			return res.status(400).json({ success: false, message: error.message });
		}
		res.status(500).json({ success: false, message: 'Server error' });
	}
};

// Soft delete faculty
export const deleteFaculty = async (req, res) => {
	try {
		const { id } = req.params;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ success: false, message: 'Invalid faculty ID' });
		}

		const faculty = await Faculty.findByIdAndUpdate(
			id,
			{ isActive: false },
			{ new: true }
		);

		if (!faculty) {
			return res.status(404).json({ success: false, message: 'Faculty not found' });
		}

		res.status(200).json({
			success: true,
			message: 'Faculty deleted successfully',
		});
	} catch {
		res.status(500).json({ success: false, message: 'Server error' });
	}
};
