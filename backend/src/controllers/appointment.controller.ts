import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { Appointment, AppointmentStatus } from '../models/Appointment.model';
import { Notification, NotificationType } from '../models/Notification.model';
import { Schedule } from '../models/Schedule.model';
import { AppError } from '../middleware/errorHandler';

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clientId = req.user?.id;
    if (!clientId) {
      return next(new AppError('Unauthorized', 401));
    }

    const { expert, scheduledAt, duration, notes } = req.body;

    if (!expert || !isValidObjectId(expert)) {
      return next(new AppError('Invalid expert ID', 400));
    }

    // Check if expert has schedule
    const schedule = await Schedule.findOne({ expert });
    if (!schedule) {
      return next(new AppError('Expert has no schedule set', 400));
    }

    // Check if time slot is available
    const appointmentTime = new Date(scheduledAt);
    const dayOfWeek = appointmentTime.getDay();
    const timeString = appointmentTime.toTimeString().slice(0, 5);

    const daySlots = schedule.timeSlots.filter(slot => slot.dayOfWeek === dayOfWeek);
    const isInSchedule = daySlots.some(slot => {
      return timeString >= slot.startTime && timeString < slot.endTime;
    });

    if (!isInSchedule) {
      return next(new AppError('Time slot not in expert schedule', 400));
    }

    // Check for conflicts
    const endTime = new Date(appointmentTime.getTime() + (duration || 60) * 60000);
    const conflicts = await Appointment.find({
      expert,
      scheduledAt: {
        $gte: appointmentTime,
        $lt: endTime,
      },
      status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.APPROVED] },
    });

    if (conflicts.length > 0) {
      return next(new AppError('Time slot already booked', 400));
    }

    const appointment = await Appointment.create({
      expert,
      client: clientId,
      scheduledAt: appointmentTime,
      duration: duration || 60,
      notes,
      status: AppointmentStatus.PENDING,
    });

    // Notify expert (non-blocking)
    try {
      await Notification.create({
        user: expert,
        type: NotificationType.APPOINTMENT_REQUEST,
        title: 'Yeni Randevu Talebi',
        message: `Yeni bir randevu talebi aldınız.`,
        relatedId: appointment._id,
      });
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
    }

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { role } = req.user || {};
    const { status, expert, client } = req.query;

    const query: any = {};

    if (role === 'expert') {
      query.expert = userId;
    } else if (role === 'client') {
      query.client = userId;
    } else if (role === 'admin') {
      // Admin can see all
    } else {
      return next(new AppError('Access denied', 403));
    }

    if (status) {
      query.status = status;
    }

    if (expert && role === 'admin') {
      if (!isValidObjectId(expert as string)) {
        return next(new AppError('Invalid expert ID', 400));
      }
      query.expert = expert;
    }

    if (client && role === 'admin') {
      if (!isValidObjectId(client as string)) {
        return next(new AppError('Invalid client ID', 400));
      }
      query.client = client;
    }

    // Pagination parameters
    const { page, limit } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // Validate pagination parameters
    if (pageNumber < 1) {
      return next(new AppError('Page number must be greater than 0', 400));
    }
    if (pageSize < 1 || pageSize > 100) {
      return next(new AppError('Limit must be between 1 and 100', 400));
    }

    // Get total count for pagination metadata
    const totalCount = await Appointment.countDocuments(query);

    // Get paginated appointments
    const appointments = await Appointment.find(query)
      .populate('expert', 'email')
      .populate('client', 'email')
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(pageSize);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    res.json({
      success: true,
      data: appointments,
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

export const getAppointmentById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { role } = req.user || {};

    if (!isValidObjectId(id)) {
      return next(new AppError('Invalid appointment ID', 400));
    }

    const appointment = await Appointment.findById(id)
      .populate('expert', 'email')
      .populate('client', 'email');

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    // Check access
    const expertId = typeof appointment.expert === 'object' 
      ? appointment.expert._id.toString() 
      : appointment.expert.toString();
    const clientId = typeof appointment.client === 'object' 
      ? appointment.client._id.toString() 
      : appointment.client.toString();
    
    if (
      role !== 'admin' &&
      expertId !== userId &&
      clientId !== userId
    ) {
      return next(new AppError('Access denied', 403));
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;
    const { role } = req.user || {};

    if (!isValidObjectId(id)) {
      return next(new AppError('Invalid appointment ID', 400));
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    // Only expert or admin can change status
    if (appointment.expert.toString() !== userId && role !== 'admin') {
      return next(new AppError('Access denied', 403));
    }

    if (!Object.values(AppointmentStatus).includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    appointment.status = status as AppointmentStatus;
    await appointment.save();

    // Notify client (non-blocking)
    try {
      let notificationType: NotificationType;
      if (status === AppointmentStatus.APPROVED) {
        notificationType = NotificationType.APPOINTMENT_APPROVED;
      } else if (status === AppointmentStatus.REJECTED) {
        notificationType = NotificationType.APPOINTMENT_REJECTED;
      } else {
        notificationType = NotificationType.APPOINTMENT_REQUEST;
      }

      await Notification.create({
        user: appointment.client,
        type: notificationType,
        title: status === AppointmentStatus.APPROVED ? 'Randevu Onaylandı' : 'Randevu Reddedildi',
        message: `Randevunuz ${status === AppointmentStatus.APPROVED ? 'onaylandı' : 'reddedildi'}.`,
        relatedId: appointment._id,
      });
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const cancelAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!isValidObjectId(id)) {
      return next(new AppError('Invalid appointment ID', 400));
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    // Client or expert can cancel
    if (
      appointment.client.toString() !== userId &&
      appointment.expert.toString() !== userId &&
      req.user?.role !== 'admin'
    ) {
      return next(new AppError('Access denied', 403));
    }

    appointment.status = AppointmentStatus.CANCELLED;
    await appointment.save();

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

