import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Uploads klasörünü oluştur
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Alt klasörler
const blogImagesDir = path.join(uploadsDir, 'blogs');
const activityImagesDir = path.join(uploadsDir, 'activities');
const profileImagesDir = path.join(uploadsDir, 'profiles');
const generalDir = path.join(uploadsDir, 'general');

[blogImagesDir, activityImagesDir, profileImagesDir, generalDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Dosya adı oluşturma fonksiyonu
const generateFileName = (req: Request, file: Express.Multer.File): string => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const ext = path.extname(file.originalname);
  return `${uniqueSuffix}${ext}`;
};

// Storage yapılandırması
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const uploadType = req.body.uploadType || req.query.uploadType || 'general';
    
    let uploadPath = generalDir;
    switch (uploadType) {
      case 'blog':
        uploadPath = blogImagesDir;
        break;
      case 'activity':
        uploadPath = activityImagesDir;
        break;
      case 'profile':
        uploadPath = profileImagesDir;
        break;
      default:
        uploadPath = generalDir;
    }
    
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, generateFileName(req, file));
  },
});

// Dosya filtresi - sadece resim dosyalarına izin ver
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları (JPEG, PNG, GIF, WEBP) yüklenebilir'));
  }
};

// Multer yapılandırması
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maksimum
  },
});

// Tek dosya yükleme
export const uploadSingle = upload.single('file');

// Çoklu dosya yükleme (maksimum 5 dosya)
export const uploadMultiple = upload.array('files', 5);

// Belirli alan adları için çoklu dosya
export const uploadFields = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'documents', maxCount: 3 },
]);

