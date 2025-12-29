import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import path from 'path';
import fs from 'fs';

export const uploadFile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!req.file) {
      return next(new AppError('Dosya yüklenmedi', 400));
    }

    const uploadType = req.body.uploadType || req.query.uploadType || 'general';
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    
    // Dosya yolunu oluştur
    let filePath = '';
    switch (uploadType) {
      case 'blog':
        filePath = `/uploads/blogs/${req.file.filename}`;
        break;
      case 'activity':
        filePath = `/uploads/activities/${req.file.filename}`;
        break;
      case 'profile':
        filePath = `/uploads/profiles/${req.file.filename}`;
        break;
      default:
        filePath = `/uploads/general/${req.file.filename}`;
    }

    const fileUrl = `${baseUrl}${filePath}`;

    res.status(201).json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        path: filePath,
        uploadType,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadMultipleFiles = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return next(new AppError('Dosya yüklenmedi', 400));
    }

    const uploadType = req.body.uploadType || req.query.uploadType || 'general';
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const files = Array.isArray(req.files) ? req.files : [];

    const uploadedFiles = files.map(file => {
      let filePath = '';
      switch (uploadType) {
        case 'blog':
          filePath = `/uploads/blogs/${file.filename}`;
          break;
        case 'activity':
          filePath = `/uploads/activities/${file.filename}`;
          break;
        case 'profile':
          filePath = `/uploads/profiles/${file.filename}`;
          break;
        default:
          filePath = `/uploads/general/${file.filename}`;
      }

      return {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `${baseUrl}${filePath}`,
        path: filePath,
      };
    });

    res.status(201).json({
      success: true,
      data: {
        files: uploadedFiles,
        count: uploadedFiles.length,
        uploadType,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      return next(new AppError('Unauthorized', 401));
    }

    const { filename, uploadType } = req.params;

    if (!filename) {
      return next(new AppError('Dosya adı gerekli', 400));
    }

    let filePath = '';
    const uploadsDir = path.join(process.cwd(), 'uploads');

    switch (uploadType) {
      case 'blog':
        filePath = path.join(uploadsDir, 'blogs', filename);
        break;
      case 'activity':
        filePath = path.join(uploadsDir, 'activities', filename);
        break;
      case 'profile':
        filePath = path.join(uploadsDir, 'profiles', filename);
        break;
      default:
        filePath = path.join(uploadsDir, 'general', filename);
    }

    // Dosya var mı kontrol et
    if (!fs.existsSync(filePath)) {
      return next(new AppError('Dosya bulunamadı', 404));
    }

    // Dosyayı sil
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Dosya başarıyla silindi',
    });
  } catch (error) {
    next(error);
  }
};

