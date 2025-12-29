import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Schedule } from '../models/Schedule.model';
import { AppError } from '../middleware/errorHandler';

export const createOrUpdateSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const expertId = req.user?.id;
    if (!expertId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const schedule = await Schedule.findOneAndUpdate(
      { expert: expertId },
      {
        expert: expertId,
        timeSlots: req.body.timeSlots,
        timezone: req.body.timezone || 'Europe/Istanbul',
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update schedule' });
  }
};

export const getSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const expertId = req.params.expertId || req.user?.id;
    if (!expertId) {
      res.status(400).json({ success: false, message: 'Expert ID required' });
      return;
    }

    const schedule = await Schedule.findOne({ expert: expertId });
    if (!schedule) {
      res.status(404).json({ success: false, message: 'Schedule not found' });
      return;
    }

    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get schedule' });
  }
};

export const getAvailableSlots = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { expertId, date } = req.query;
    if (!expertId || !date) {
      res.status(400).json({ success: false, message: 'Expert ID and date required' });
      return;
    }

    const schedule = await Schedule.findOne({ expert: expertId });
    if (!schedule) {
      res.json({ success: true, data: [] });
      return;
    }

    const Appointment = (await import('../models/Appointment.model')).Appointment;
    const requestedDate = new Date(date as string);
    const dayOfWeek = requestedDate.getDay();

    // Get time slots for this day
    const daySlots = schedule.timeSlots.filter(slot => slot.dayOfWeek === dayOfWeek);

    // Get existing appointments for this date
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      expert: expertId,
      scheduledAt: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'approved'] },
    });

    // Generate available slots
    const availableSlots: string[] = [];
    daySlots.forEach(slot => {
      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const [endHour, endMin] = slot.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      for (let minutes = startMinutes; minutes < endMinutes; minutes += 60) {
        const hour = Math.floor(minutes / 60);
        const min = minutes % 60;
        const timeString = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        const slotTime = new Date(requestedDate);
        slotTime.setHours(hour, min, 0, 0);

        // Check if slot conflicts with existing appointment
        const hasConflict = appointments.some(apt => {
          const aptTime = new Date(apt.scheduledAt);
          const aptEnd = new Date(aptTime.getTime() + apt.duration * 60000);
          return slotTime >= aptTime && slotTime < aptEnd;
        });

        if (!hasConflict) {
          availableSlots.push(timeString);
        }
      }
    });

    res.json({ success: true, data: availableSlots });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get available slots' });
  }
};

