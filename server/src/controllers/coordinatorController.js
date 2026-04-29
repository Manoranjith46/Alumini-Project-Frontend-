import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import Coordinator from '../models/coordinator.js';
import { sendSmsOtp, verifySmsOtp } from '../utils/messanger.js';

const cleanString = (value) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

const normalizeDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const normalizePhoneForCompare = (value = '') =>
  value.replace(/\s+/g, '').replace(/^\+91/, '');

const sanitizePersonalInfo = (personalInfo) => {
  if (!personalInfo || typeof personalInfo !== 'object') return undefined;

  const data = {};

  if (Object.prototype.hasOwnProperty.call(personalInfo, 'dob')) {
    const dob = normalizeDate(personalInfo.dob);
    if (dob) data.dob = dob;
  }

  if (Object.prototype.hasOwnProperty.call(personalInfo, 'gender')) {
    const gender = cleanString(personalInfo.gender);
    data.gender = gender;
  }

  if (Object.prototype.hasOwnProperty.call(personalInfo, 'bloodGroup')) {
    const bloodGroup = cleanString(personalInfo.bloodGroup);
    data.bloodGroup = bloodGroup;
  }

  if (Object.prototype.hasOwnProperty.call(personalInfo, 'address')) {
    const address = cleanString(personalInfo.address);
    data.address = address;
  }

  return data;
};

const sanitizeEducation = (education) => {
  if (!Array.isArray(education)) return undefined;

  return education
    .map((item) => {
      const degree = cleanString(item?.degree);
      const institution = cleanString(item?.institution);
      const year = cleanString(item?.year);

      return {
        degree,
        institution,
        year,
      };
    })
    .filter((item) => item.degree || item.institution || item.year);
};

const buildCoordinatorProfileUpdate = (payload = {}) => {
  const updateData = {};

  if (Object.prototype.hasOwnProperty.call(payload, 'name')) {
    const name = cleanString(payload.name);
    if (name) updateData.name = name;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'email')) {
    const email = cleanString(payload.email);
    if (email) updateData.email = email.toLowerCase();
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'phone')) {
    updateData.phone = cleanString(payload.phone);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'staffId')) {
    const staffId = cleanString(payload.staffId);
    if (staffId) updateData.staffId = staffId;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'designation')) {
    const designation = cleanString(payload.designation);
    if (designation) updateData.designation = designation;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'department')) {
    const department = cleanString(payload.department);
    if (department) updateData.department = department;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'role')) {
    const role = cleanString(payload.role);
    if (role) updateData.role = role;
  } else if (Object.prototype.hasOwnProperty.call(payload, 'roles') && Array.isArray(payload.roles)) {
    // Backward compatibility: accept legacy roles array and map first value to role
    const role = cleanString(payload.roles[0]);
    if (role) updateData.role = role;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'location')) {
    updateData.location = cleanString(payload.location);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'status')) {
    const status = cleanString(payload.status);
    if (status) updateData.status = status;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'joinDate')) {
    const joinDate = normalizeDate(payload.joinDate);
    if (joinDate) updateData.joinDate = joinDate;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'experience')) {
    updateData.experience = cleanString(payload.experience);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'publications')) {
    const publications = Number(payload.publications);
    if (!Number.isNaN(publications)) {
      updateData.publications = Math.max(0, publications);
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'patents')) {
    const patents = Number(payload.patents);
    if (!Number.isNaN(patents)) {
      updateData.patents = Math.max(0, patents);
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'personalInfo')) {
    updateData.personalInfo = sanitizePersonalInfo(payload.personalInfo);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'education')) {
    updateData.education = sanitizeEducation(payload.education);
  }

  return updateData;
};

// Create a new coordinator (creates both User and Coordinator records)
export const createCoordinator = async (req, res) => {
  try {
    const {
      // User authentication details
      userId,
      name,
      email,
      password,

      // Coordinator details
      staffId,
      designation,
      department,
      role = 'coordinator', // Default coordinator role
      roles, // Legacy fallback from older clients
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

    const normalizedRole =
      cleanString(role) ||
      (Array.isArray(roles) ? cleanString(roles[0]) : undefined) ||
      'coordinator';

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

    // Check if coordinator with staffId already exists
    const existingCoordinator = await Coordinator.findOne({ staffId });
    if (existingCoordinator) {
      return res.status(400).json({
        success: false,
        message: 'Coordinator with this Staff ID already exists'
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
      role: 'coordinator', // All coordinators get coordinator role
    });

    // Create Coordinator record with detailed information
    const coordinator = await Coordinator.create({
      userId: newUser._id,
      staffId,
      name,
      designation,
      department,
      role: normalizedRole,
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

    // Populate the coordinator with user details for response
    const populatedCoordinator = await Coordinator.findById(coordinator._id)
      .populate('userId', 'userId name email role');

    res.status(201).json({
      success: true,
      message: 'Coordinator created successfully',
      coordinator: populatedCoordinator,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    console.error('Error creating coordinator:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all coordinators
export const getAllCoordinators = async (req, res) => {
  try {
    const { department, status, role } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (status) filter.status = status;
    if (role) {
      filter.$or = [{ role }, { roles: { $in: [role] } }];
    }

    const coordinators = await Coordinator.find(filter)
      .populate('userId', 'userId name email role')
      .sort({ name: 1 });

    res.status(200).json({ success: true, coordinators });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get coordinators by department
export const getCoordinatorsByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const upperDept = department.toUpperCase();

    // First, find the department by code to get the full branch name
    const Department = (await import('../models/department.js')).default;
    const deptRecord = await Department.findOne({
      deptCode: upperDept,
      isActive: true
    });

    if (!deptRecord) {
      return res.status(404).json({
        success: false,
        message: `Department with code ${upperDept} not found`
      });
    }

    // Now search coordinators by the full branch name
    const coordinators = await Coordinator.find({
      department: deptRecord.branch
    })
      .populate('userId', 'userId name email role')
      .sort({ name: 1 });

    res.status(200).json({ success: true, coordinators });
  } catch (error) {
    console.error('Error in getCoordinatorsByDepartment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get coordinator's own profile
export const getMyProfile = async (req, res) => {
  try {
    // Get coordinator profile based on authenticated user's ID
    const coordinator = await Coordinator.findOne({ userId: req.user.id });

    if (!coordinator) {
      // Return empty profile if not created yet
      return res.status(200).json({
        success: true,
        data: null,
        message: 'Profile not set up yet'
      });
    }

    return res.status(200).json({
      success: true,
      data: coordinator
    });
  } catch (error) {
    console.error('[CoordinatorController] getMyProfile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch coordinator profile',
      error: error.message
    });
  }
};

// Update coordinator's own profile
export const updateMyProfile = async (req, res) => {
  try {
    if (req.user.role !== 'coordinator') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Coordinator privileges required.'
      });
    }

    const existingCoordinator = await Coordinator.findOne({ userId: req.user.id });

    if (!existingCoordinator) {
      return res.status(404).json({
        success: false,
        message: 'Coordinator profile not found. Please contact admin to set up your profile.'
      });
    }

    const updateData = buildCoordinatorProfileUpdate(req.body);

    // Preserve required values if they are not being changed
    const requiredData = {
      name: updateData.name || existingCoordinator.name,
      email: updateData.email || existingCoordinator.email,
      staffId: updateData.staffId || existingCoordinator.staffId,
      designation: updateData.designation || existingCoordinator.designation,
      department: updateData.department || existingCoordinator.department,
      joinDate: updateData.joinDate || existingCoordinator.joinDate,
    };

    if (!requiredData.name || !requiredData.email || !requiredData.staffId || !requiredData.designation || !requiredData.department || !requiredData.joinDate) {
      return res.status(400).json({
        success: false,
        message: 'Required profile fields are missing.'
      });
    }

    // Unique email check across User model
    if (updateData.email && updateData.email !== existingCoordinator.email) {
      const conflictingUser = await User.findOne({
        email: updateData.email,
        _id: { $ne: req.user.id },
      });

      if (conflictingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Unique staffId check in Coordinator model
    if (updateData.staffId && updateData.staffId !== existingCoordinator.staffId) {
      const conflictingCoordinator = await Coordinator.findOne({
        staffId: updateData.staffId,
        _id: { $ne: existingCoordinator._id },
      });

      if (conflictingCoordinator) {
        return res.status(400).json({
          success: false,
          message: 'staffId already exists'
        });
      }
    }

    const coordinator = await Coordinator.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    );

    // Keep auth User document in sync for login name/email
    const userUpdate = {};
    if (updateData.name) userUpdate.name = updateData.name;
    if (updateData.email) userUpdate.email = updateData.email;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(
        req.user.id,
        { $set: userUpdate },
        { runValidators: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: coordinator
    });
  } catch (error) {
    console.error('[CoordinatorController] updateMyProfile error:', error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Update coordinator password
export const updateCoordinatorPassword = async (req, res) => {
  try {
    if (req.user.role !== 'coordinator') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Coordinator privileges required.'
      });
    }

    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All password fields are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('[CoordinatorController] updateCoordinatorPassword error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update password',
      error: error.message,
    });
  }
};

// Send OTP for coordinator password reset
export const sendCoordinatorResetOtp = async (req, res) => {
  try {
    if (req.user.role !== 'coordinator') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Coordinator privileges required.',
      });
    }

    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required',
      });
    }

    const coordinator = await Coordinator.findOne({ userId: req.user.id });

    if (!coordinator) {
      return res.status(404).json({
        success: false,
        message: 'Coordinator profile not found',
      });
    }

    if (!coordinator.phone) {
      return res.status(400).json({
        success: false,
        message: 'No mobile number found in coordinator profile',
      });
    }

    const cleanIncoming = normalizePhoneForCompare(mobile);
    const cleanStored = normalizePhoneForCompare(coordinator.phone);

    if (cleanIncoming !== cleanStored) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number does not match our records',
      });
    }

    const phoneForTwilio = mobile.startsWith('+') ? mobile : `+91${cleanIncoming}`;
    const smsResult = await sendSmsOtp(phoneForTwilio);

    if (!smsResult.success) {
      return res.status(500).json({
        success: false,
        message: `Failed to send OTP via SMS: ${smsResult.message}`,
      });
    }

    coordinator.resetPhoneNumber = phoneForTwilio;
    coordinator.twilioVerificationSid = smsResult.verificationSid;
    coordinator.resetOtpVerifiedAt = undefined;
    await coordinator.save();

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your registered mobile number',
    });
  } catch (error) {
    console.error('[CoordinatorController] sendCoordinatorResetOtp error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message,
    });
  }
};

// Verify coordinator OTP for password reset
export const verifyCoordinatorResetOtp = async (req, res) => {
  try {
    if (req.user.role !== 'coordinator') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Coordinator privileges required.',
      });
    }

    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'OTP code is required',
      });
    }

    const coordinator = await Coordinator.findOne({ userId: req.user.id });

    if (!coordinator) {
      return res.status(404).json({
        success: false,
        message: 'Coordinator profile not found',
      });
    }

    if (!coordinator.resetPhoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'No OTP request found. Please request a new OTP.',
      });
    }

    const verifyResult = await verifySmsOtp(coordinator.resetPhoneNumber, code);

    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        message: verifyResult.message,
      });
    }

    coordinator.resetOtpVerifiedAt = new Date();
    coordinator.resetPhoneNumber = undefined;
    coordinator.twilioVerificationSid = undefined;
    await coordinator.save();

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('[CoordinatorController] verifyCoordinatorResetOtp error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message,
    });
  }
};

// Reset coordinator password after OTP verification
export const resetCoordinatorPassword = async (req, res) => {
  try {
    if (req.user.role !== 'coordinator') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Coordinator privileges required.',
      });
    }

    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both password fields are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const coordinator = await Coordinator.findOne({ userId: req.user.id });

    if (!coordinator || !coordinator.resetOtpVerifiedAt) {
      return res.status(400).json({
        success: false,
        message: 'Please verify OTP first',
      });
    }

    // OTP verification valid for 10 minutes
    const verificationTime = new Date(coordinator.resetOtpVerifiedAt);
    const now = new Date();
    const timeDiff = now - verificationTime;
    const tenMinutesMs = 10 * 60 * 1000;

    if (timeDiff > tenMinutesMs) {
      coordinator.resetOtpVerifiedAt = undefined;
      await coordinator.save();
      return res.status(400).json({
        success: false,
        message: 'OTP verification expired. Please request a new OTP.',
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    coordinator.resetOtpVerifiedAt = undefined;
    await coordinator.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('[CoordinatorController] resetCoordinatorPassword error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message,
    });
  }
};

// Get coordinator by ID
export const getCoordinatorById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid coordinator ID' });
    }

    const coordinator = await Coordinator.findOne({ _id: id })
      .populate('userId', 'userId name email role');

    if (!coordinator) {
      return res.status(404).json({ success: false, message: 'Coordinator not found' });
    }

    res.status(200).json({ success: true, coordinator });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update coordinator
export const updateCoordinator = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid coordinator ID' });
    }

    const updatePayload = { ...req.body };
    if (!updatePayload.role && Array.isArray(updatePayload.roles)) {
      updatePayload.role = cleanString(updatePayload.roles[0]);
    }
    delete updatePayload.roles;

    const coordinator = await Coordinator.findByIdAndUpdate(id, updatePayload, {
      returnDocument: 'after',
      runValidators: true,
    }).populate('userId', 'userId name email role');

    if (!coordinator) {
      return res.status(404).json({ success: false, message: 'Coordinator not found' });
    }

    // Keep User document in sync when admin edits faculty identity fields
    const userUpdate = {};
    if (req.body?.name) userUpdate.name = req.body.name;
    if (req.body?.email) userUpdate.email = req.body.email;

    if (Object.keys(userUpdate).length > 0 && coordinator.userId?._id) {
      await User.findByIdAndUpdate(coordinator.userId._id, { $set: userUpdate }, { runValidators: true });
    }

    res.status(200).json({
      success: true,
      message: 'Coordinator updated successfully',
      coordinator,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Hard delete coordinator and associated user
export const deleteCoordinator = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid coordinator ID' });
    }

    // Find the coordinator to get the associated userId
    const coordinator = await Coordinator.findById(id);

    if (!coordinator) {
      return res.status(404).json({ success: false, message: 'Coordinator not found' });
    }

    // Delete coordinator profile
    await Coordinator.findByIdAndDelete(id);

    // Also delete the associated user
    if (coordinator.userId) {
      await User.findByIdAndDelete(coordinator.userId);
    }

    res.status(200).json({
      success: true,
      message: 'Coordinator and associated user account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting coordinator:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
