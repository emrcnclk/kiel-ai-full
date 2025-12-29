import { Router } from 'express';
import { uploadFile, uploadMultipleFiles, deleteFile } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadSingle, uploadMultiple } from '../middleware/upload.middleware';

const router = Router();

// Tek dosya yükleme
router.post('/single', authenticate, uploadSingle, uploadFile);

// Çoklu dosya yükleme
router.post('/multiple', authenticate, uploadMultiple, uploadMultipleFiles);

// Dosya silme
router.delete('/:uploadType/:filename', authenticate, deleteFile);

export default router;

