import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ExpertProfile } from '../models/ExpertProfile.model';
import { ClientProfile } from '../models/ClientProfile.model';
import { User } from '../models/User.model';
import { AppError } from '../middleware/errorHandler';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (req.user?.role === 'expert') {
      const profile = await ExpertProfile.findOne({ user: userId }).populate('user', 'email role');
      if (!profile) {
        res.status(404).json({ success: false, message: 'Profile not found' });
        return;
      }
      res.json({ success: true, data: profile });
      return;
    }

    if (req.user?.role === 'client') {
      const profile = await ClientProfile.findOne({ user: userId }).populate('user', 'email role');
      if (!profile) {
        res.status(404).json({ success: false, message: 'Profile not found' });
        return;
      }
      res.json({ success: true, data: profile });
      return;
    }

    res.status(400).json({ success: false, message: 'Invalid role' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const updateData = req.body;

    if (req.user?.role === 'expert') {
      const profile = await ExpertProfile.findOneAndUpdate(
        { user: userId },
        updateData,
        { new: true, runValidators: true }
      );
      if (!profile) {
        res.status(404).json({ success: false, message: 'Profile not found' });
        return;
      }
      res.json({ success: true, data: profile });
      return;
    }

    if (req.user?.role === 'client') {
      const profile = await ClientProfile.findOneAndUpdate(
        { user: userId },
        updateData,
        { new: true, runValidators: true }
      );
      if (!profile) {
        res.status(404).json({ success: false, message: 'Profile not found' });
        return;
      }
      res.json({ success: true, data: profile });
      return;
    }

    res.status(400).json({ success: false, message: 'Invalid role' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const getAllExperts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const experts = await ExpertProfile.find()
      .populate('user', '_id email role')
      .select('-__v');
    res.json({ success: true, data: experts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get experts' });
  }
};

export const getExpertById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const expert = await ExpertProfile.findOne({ user: id })
      .populate('user', 'email role');
    if (!expert) {
      res.status(404).json({ success: false, message: 'Expert not found' });
      return;
    }
    res.json({ success: true, data: expert });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get expert' });
  }
};

