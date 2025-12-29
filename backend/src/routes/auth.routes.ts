import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refresh, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['expert', 'client', 'admin']),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refresh);
router.get('/me', authenticate, getMe);

export default router;

