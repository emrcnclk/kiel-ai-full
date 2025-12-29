import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Message } from '../models/Message.model';
import { Notification, NotificationType } from '../models/Notification.model';
import { User } from '../models/User.model';
import { AppError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Get all unique conversation partners
    const sentMessages = await Message.find({ sender: userId }).distinct('receiver');
    const receivedMessages = await Message.find({ receiver: userId }).distinct('sender');
    const allPartners = [...new Set([...sentMessages, ...receivedMessages])];

    // Get last message for each conversation
    const conversations = await Promise.all(
      allPartners.map(async partnerId => {
        const lastMessage = await Message.findOne({
          $or: [
            { sender: userId, receiver: partnerId },
            { sender: partnerId, receiver: userId },
          ],
        })
          .sort({ createdAt: -1 })
          .populate('sender', 'email')
          .populate('receiver', 'email');

        const partner = await User.findById(partnerId).select('email role');
        const unreadCount = await Message.countDocuments({
          sender: partnerId,
          receiver: userId,
          isRead: false,
        });

        return {
          partner: {
            id: partner?._id,
            email: partner?.email,
            role: partner?.role,
          },
          lastMessage,
          unreadCount,
        };
      })
    );

    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get conversations' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { partnerId } = req.params;
    const { page, limit } = req.query;

    if (!userId) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!isValidObjectId(partnerId)) {
      return next(new AppError('Invalid partner ID', 400));
    }

    // Pagination parameters
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 50;
    const skip = (pageNumber - 1) * pageSize;

    // Validate pagination parameters
    if (pageNumber < 1) {
      return next(new AppError('Page number must be greater than 0', 400));
    }
    if (pageSize < 1 || pageSize > 100) {
      return next(new AppError('Limit must be between 1 and 100', 400));
    }

    const messageQuery = {
      $or: [
        { sender: userId, receiver: partnerId },
        { sender: partnerId, receiver: userId },
      ],
    };

    // Get total count for pagination metadata
    const totalCount = await Message.countDocuments(messageQuery);

    // Get paginated messages (most recent first, then reverse for display)
    const messages = await Message.find(messageQuery)
      .populate('sender', 'email')
      .populate('receiver', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    // Reverse to show oldest first (for chat UI)
    const reversedMessages = messages.reverse();

    // Mark messages as read
    await Message.updateMany(
      {
        sender: partnerId,
        receiver: userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    res.json({
      success: true,
      data: reversedMessages,
      pagination: {
        currentPage: pageNumber,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const senderId = req.user?.id;
    const { receiverId, content } = req.body;

    if (!senderId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!receiverId || !content) {
      res.status(400).json({ success: false, message: 'Receiver ID and content required' });
      return;
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'email')
      .populate('receiver', 'email');

    // Notify receiver
    await Notification.create({
      user: receiverId,
      type: NotificationType.NEW_MESSAGE,
      title: 'Yeni Mesaj',
      message: `Yeni bir mesaj aldınız.`,
      relatedId: message._id,
    });

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { messageId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const message = await Message.findById(messageId);
    if (!message) {
      res.status(404).json({ success: false, message: 'Message not found' });
      return;
    }

    if (message.receiver.toString() !== userId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark message as read' });
  }
};

