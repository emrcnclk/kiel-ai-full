import { Router } from 'express';
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  toggleLike,
} from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createComment);
router.get('/', authenticate, getComments);
router.patch('/:id', authenticate, updateComment);
router.delete('/:id', authenticate, deleteComment);
router.post('/:id/like', authenticate, toggleLike);

export default router;

