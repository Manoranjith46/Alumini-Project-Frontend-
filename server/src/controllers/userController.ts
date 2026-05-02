import type { Request, Response } from 'express';
import User from '../models/user.js';
import Alumni from '../models/alumni.js';

export const searchAlumniAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, department, batch } = req.query as { name?: string; department?: string; batch?: string };

    if (!name || !department || !batch) {
      res.status(400).json({
        success: false,
        message: 'Name, department, and batch are required'
      });
      return;
    }

    const batchParts = batch.split('-');
    const yearFrom = parseInt(batchParts[0]);
    const yearTo = batchParts[1] ? parseInt(batchParts[1]) : yearFrom + 4;

    const alumni = await Alumni.find({
      name: { $regex: name, $options: 'i' },
      branch: { $regex: department, $options: 'i' },
      yearFrom: yearFrom,
      yearTo: yearTo
    }).select('name email branch yearFrom yearTo profilePhoto');

    if (alumni.length === 0) {
      res.json({
        success: false,
        message: 'No alumni found',
        alumni: []
      });
      return;
    }

    const formattedAlumni = alumni.map(a => ({
      _id: a._id,
      name: a.name,
      email: a.email,
      branch: a.branch,
      batch: `${a.yearFrom}-${a.yearTo}`,
      profilePicture: a.profilePhoto ? `/api/images/${a.profilePhoto}` : null
    }));

    res.json({
      success: true,
      alumni: formattedAlumni,
      count: formattedAlumni.length
    });

  } catch (error) {
    console.error('Error searching alumni:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching alumni',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const searchAlumniByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.query as { email?: string };

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      });
      return;
    }

    const alumni = await Alumni.findOne({
      email: { $regex: `^${email}$`, $options: 'i' }
    }).select('name email branch yearFrom yearTo profilePhoto');

    if (!alumni) {
      res.json({
        success: false,
        message: 'Alumni not found'
      });
      return;
    }

    res.json({
      success: true,
      alumni: {
        _id: alumni._id,
        name: alumni.name,
        email: alumni.email,
        branch: alumni.branch,
        batch: `${alumni.yearFrom}-${alumni.yearTo}`,
        profilePicture: alumni.profilePhoto ? `/api/images/${alumni.profilePhoto}` : null
      }
    });

  } catch (error) {
    console.error('Error searching alumni by email:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching alumni',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
      return;
    }

    const { search, limit = '50' } = req.query as { search?: string; limit?: string };
    let query: Record<string, any> = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { userId: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('-password')
      .limit(parseInt(limit, 10))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
      count: users.length
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getUsersByRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = req.params.role as string;
    const { search, limit = '50' } = req.query as { search?: string; limit?: string };

    const validRoles = ['alumni', 'admin', 'coordinator'];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
      return;
    }

    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'coordinator')) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Coordinator privileges required.'
      });
      return;
    }

    let query: Record<string, any> = { role };

    if (search) {
      query.$and = [
        { role },
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { userId: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(parseInt(limit, 10))
      .sort({ name: 1 });

    const responseKey = role === 'alumni' ? 'alumni' : 'users';

    res.json({
      success: true,
      [responseKey]: users,
      count: users.length
    });

  } catch (error) {
    console.error(`Error fetching ${req.params.role}:`, error);
    res.status(500).json({
      success: false,
      message: `Server error while fetching ${req.params.role}`,
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'coordinator' && req.user._id.toString() !== id)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own profile.'
      });
      return;
    }

    const user = await User.findById(id).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!req.user || (req.user.role !== 'admin' && req.user._id.toString() !== id)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own profile.'
      });
      return;
    }

    if (req.user.role !== 'admin') {
      delete updates.role;
      delete updates.userId;
    }

    delete updates.password;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { returnDocument: 'after', runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
      return;
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
