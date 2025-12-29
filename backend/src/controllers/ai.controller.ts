import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { chatWithAI, summarizeContent, recommendActivities } from '../services/ai.service';
import { AIChat } from '../models/AIChat.model';
import { Notification, NotificationType } from '../models/Notification.model';

export const chat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { message } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!message) {
      res.status(400).json({ success: false, message: 'Message required' });
      return;
    }

    // Get chat history
    const existingChat = await AIChat.findOne({ user: userId }).sort({ createdAt: -1 });
    const chatHistory = existingChat?.messages || [];

    const aiResponse = await chatWithAI(userId, message, chatHistory);

    res.json({
      success: true,
      data: {
        message: aiResponse,
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get AI response',
    });
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const chats = await AIChat.find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({ success: true, data: chats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get chat history' });
  }
};

export const getChatById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const chat = await AIChat.findById(id);
    if (!chat) {
      res.status(404).json({ success: false, message: 'Chat not found' });
      return;
    }

    if (chat.user.toString() !== userId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    res.json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get chat' });
  }
};

export const summarize = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { content } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!content) {
      res.status(400).json({ success: false, message: 'Content required' });
      return;
    }

    const summary = await summarizeContent(content);

    // Notify user
    await Notification.create({
      user: userId,
      type: NotificationType.AI_SUMMARY_READY,
      title: 'Özet Hazır',
      message: 'İçerik özetiniz hazır.',
    });

    res.json({
      success: true,
      data: {
        summary,
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to summarize content',
    });
  }
};

export const getRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (req.user?.role !== 'client') {
      res.status(403).json({ success: false, message: 'Only clients can get recommendations' });
      return;
    }

    const activityIds = await recommendActivities(userId);
    const Activity = (await import('../models/Activity.model')).Activity;
    const activities = await Activity.find({ _id: { $in: activityIds } });

    res.json({
      success: true,
      data: activities,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get recommendations',
    });
  }
};

