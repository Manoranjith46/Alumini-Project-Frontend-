import type { Request, Response } from 'express';
import { comparePassword } from '../security/bcrypt.js';
import { generateToken } from '../security/jwt.js';
import User from '../models/user.js';
import { findCoordinatorForUser } from '../utils/coordinatorResolver.js';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    // Find user by email or userId (register number)
    const user = await User.findOne({
      $or: [{ email: identifier }, { userId: identifier }],
    });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Compare passwords
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Generate JWT
    const token = generateToken({ id: user._id, role: user.role });

    // Base user response
    const userResponse: Record<string, any> = {
      id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // If coordinator, fetch department information
    if (user.role === 'coordinator') {
      try {
        const coordinator = await findCoordinatorForUser(user);
        if (coordinator) {
          userResponse.department = coordinator.department; // Full branch name e.g., "Computer Science and Engineering"
          userResponse.designation = coordinator.designation;
          userResponse.staffId = coordinator.staffId;
        }
      } catch (error) {
        console.warn('Could not fetch coordinator details:', error instanceof Error ? error.message : String(error));
      }
    }

    res.status(200).json({
      success: true,
      message: 'Authenticated successfully',
      token,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { access_token, credential } = req.body;
    let email: string | undefined;

    if (credential) {
      // Handle credential (JWT) from GoogleLogin component
      // Decode the JWT to get user info (the JWT is already verified by Google)
      const payload = JSON.parse(
        Buffer.from(credential.split('.')[1], 'base64').toString()
      );
      email = payload.email;
    } else if (access_token) {
      // Handle access_token from useGoogleLogin hook (legacy)
      const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!googleRes.ok) {
        res.status(401).json({
          success: false,
          message: 'Invalid Google token',
        });
        return;
      }

      const googleUser = await googleRes.json() as { email: string };
      email = googleUser.email;
    } else {
      res.status(400).json({
        success: false,
        message: 'No token provided',
      });
      return;
    }

    // Check if user exists in the database
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Contact Your Admin',
      });
      return;
    }

    // Generate JWT
    const token = generateToken({ id: user._id, role: user.role });

    // Base user response
    const userResponse: Record<string, any> = {
      id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // If coordinator, fetch department information
    if (user.role === 'coordinator') {
      try {
        const coordinator = await findCoordinatorForUser(user);
        if (coordinator) {
          userResponse.department = coordinator.department;
          userResponse.designation = coordinator.designation;
          userResponse.staffId = coordinator.staffId;
        }
      } catch (error) {
        console.warn('Could not fetch coordinator details:', error instanceof Error ? error.message : String(error));
      }
    }

    res.status(200).json({
      success: true,
      message: 'Authenticated successfully',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
};
