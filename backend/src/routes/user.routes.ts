import { Router } from 'express';
import { getProfile, updateProfile, getAllExperts, getExpertById } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User.model';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/experts', authenticate, getAllExperts);
router.get('/experts/:id', authenticate, getExpertById);

export default router;

