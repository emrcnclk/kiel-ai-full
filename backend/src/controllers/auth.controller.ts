import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { registerUser, loginUser, refreshAccessToken } from '../services/auth.service';
import { AppError } from '../middleware/errorHandler';
import { body, validationResult } from 'express-validator';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const result = await registerUser(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

export const refresh = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Refresh token required' });
      return;
    }

    const result = await refreshAccessToken(refreshToken);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const User = (await import('../models/User.model')).User;
    const ExpertProfile = (await import('../models/ExpertProfile.model')).ExpertProfile;
    const ClientProfile = (await import('../models/ClientProfile.model')).ClientProfile;

    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    let profile = null;
    if (user.role === 'expert') {
      profile = await ExpertProfile.findOne({ user: user._id });
    } else if (user.role === 'client') {
      profile = await ClientProfile.findOne({ user: user._id });
    }

    res.json({
      success: true,
      data: {
        user,
        profile,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
    });
  }
};

