import { Router } from 'express';
import {
  createOrUpdateHealthLog,
  getHealthLogs,
  getHealthLogById,
  deleteHealthLog,
  getHealthStats,
} from '../controllers/healthLog.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createOrUpdateHealthLog);
router.get('/', authenticate, getHealthLogs);
router.get('/stats', authenticate, getHealthStats);
router.get('/:id', authenticate, getHealthLogById);
router.delete('/:id', authenticate, deleteHealthLog);

export default router;

