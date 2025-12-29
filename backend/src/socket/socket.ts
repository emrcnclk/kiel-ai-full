import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Message } from '../models/Message.model';
import { Notification, NotificationType } from '../models/Notification.model';
import { User } from '../models/User.model';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const setupSocketIO = (io: Server): void => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
        id: string;
        email: string;
        role: string;
      };

      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Handle sending messages
    socket.on('send_message', async (data: { receiverId: string; content: string }) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        const message = await Message.create({
          sender: socket.userId,
          receiver: data.receiverId,
          content: data.content,
        });

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'email')
          .populate('receiver', 'email');

        // Notify receiver
        await Notification.create({
          user: data.receiverId,
          type: NotificationType.NEW_MESSAGE,
          title: 'Yeni Mesaj',
          message: `Yeni bir mesaj aldınız.`,
          relatedId: message._id,
        });

        // Emit to receiver
        io.to(`user:${data.receiverId}`).emit('new_message', populatedMessage);
        socket.emit('message_sent', populatedMessage);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data: { receiverId: string; isTyping: boolean }) => {
      socket.to(`user:${data.receiverId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: data.isTyping,
      });
    });

    // Handle read receipt
    socket.on('mark_read', async (data: { messageId: string }) => {
      try {
        if (!socket.userId) {
          return;
        }

        const message = await Message.findById(data.messageId);
        if (message && message.receiver.toString() === socket.userId) {
          message.isRead = true;
          message.readAt = new Date();
          await message.save();

          // Notify sender
          io.to(`user:${message.sender.toString()}`).emit('message_read', {
            messageId: data.messageId,
            readAt: message.readAt,
          });
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};

