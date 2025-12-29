import { Router } from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createAppointment);
router.get('/', authenticate, getAppointments);
router.get('/:id', authenticate, getAppointmentById);
router.patch('/:id/status', authenticate, updateAppointmentStatus);
router.patch('/:id/cancel', authenticate, cancelAppointment);

export default router;

