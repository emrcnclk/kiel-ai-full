import { Router } from 'express';
import { generateProgressReport } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/progress', authenticate, generateProgressReport);

export default router;

