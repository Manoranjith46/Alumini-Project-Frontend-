import { comparePassword } from '../security/bycrypt.js';
import { generateToken } from '../security/jwt.js';
import User from '../models/user.js';



export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find user by email or userId (register number)
    const user = await User.findOne({
      $or: [{ email: identifier }, { userId: identifier }],
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Compare passwords
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT
    const token = generateToken({ id: user._id, role: user.role });

    res.status(200).json({
      success: true,
      message: 'Authenticated successfully',
      token,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};