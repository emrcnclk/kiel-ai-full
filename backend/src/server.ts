import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import blogRoutes from './routes/blog.routes';
import activityRoutes from './routes/activity.routes';
import appointmentRoutes from './routes/appointment.routes';
import scheduleRoutes from './routes/schedule.routes';
import chatRoutes from './routes/chat.routes';
import aiRoutes from './routes/ai.routes';
import notificationRoutes from './routes/notification.routes';
import uploadRoutes from './routes/upload.routes';
import statsRoutes from './routes/stats.routes';
import badgeRoutes from './routes/badge.routes';
import { setupSocketIO } from './socket/socket';
import { errorHandler } from './middleware/errorHandler';
import path from 'path';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving - Uploads klasörünü serve et
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/badges', badgeRoutes);

// Health check with database status
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const isConnected = dbStatus === 1;
  
  res.status(isConnected ? 200 : 503).json({
    status: isConnected ? 'ok' : 'error',
    message: 'KIEL-AI-FULL API is running',
    database: {
      status: dbStates[dbStatus] || 'unknown',
      connected: isConnected,
      uri: process.env.MONGODB_URI ? 'configured' : 'using default (localhost:27017)'
    }
  });
});

// Socket.IO setup
setupSocketIO(io);

// Error handler
app.use(errorHandler);

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kiel-ai-full';
    
    // MongoDB connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

    await mongoose.connect(mongoUri);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('💡 MongoDB\'nin çalıştığından emin olun: mongod veya MongoDB servisi');
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export { io };

