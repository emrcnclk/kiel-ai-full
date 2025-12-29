import { Router } from 'express';
import { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog } from '../controllers/blog.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User.model';

const router = Router();

router.post('/', authenticate, authorize(UserRole.EXPERT, UserRole.ADMIN), createBlog);
router.get('/', authenticate, getBlogs);
router.get('/:id', authenticate, getBlogById);
router.put('/:id', authenticate, authorize(UserRole.EXPERT, UserRole.ADMIN), updateBlog);
router.delete('/:id', authenticate, authorize(UserRole.EXPERT, UserRole.ADMIN), deleteBlog);

export default router;

