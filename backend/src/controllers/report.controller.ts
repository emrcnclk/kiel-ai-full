import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { ActivityCompletion } from '../models/ActivityCompletion.model';
import { Activity } from '../models/Activity.model';
import { Badge } from '../models/Badge.model';
import { ClientProfile } from '../models/ClientProfile.model';
import { User } from '../models/User.model';
import PDFDocument from 'pdfkit';
import mongoose from 'mongoose';

export const generateProgressReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { role } = req.user || {};
    const { period = 'month' } = req.query;

    if (!userId) {
      return next(new AppError('Unauthorized', 401));
    }

    // Get user profile
    const user = await User.findById(userId).select('email role');
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Only clients can generate their own reports, admins can generate for any user
    const targetUserId = role === 'admin' && req.query.userId ? req.query.userId : userId;
    
    if (role !== 'admin' && targetUserId !== userId) {
      return next(new AppError('Access denied', 403));
    }

    const clientProfile = await ClientProfile.findOne({ user: targetUserId })
      .populate('user', 'email');
    
    if (!clientProfile) {
      return next(new AppError('Client profile not found', 404));
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get activity completions
    const completions = await ActivityCompletion.find({
      client: targetUserId,
      completedAt: { $gte: startDate },
    })
      .populate('activity')
      .sort({ completedAt: -1 });

    // Get badges
    const badges = await Badge.find({
      user: targetUserId,
      earnedAt: { $gte: startDate },
    }).sort({ earnedAt: -1 });

    // Get statistics
    const totalCompletions = await ActivityCompletion.countDocuments({ client: targetUserId });
    const totalBadges = await Badge.countDocuments({ user: targetUserId });
    const categoryStats = await ActivityCompletion.aggregate([
      {
        $match: { client: new mongoose.Types.ObjectId(targetUserId) },
      },
      {
        $lookup: {
          from: 'activities',
          localField: 'activity',
          foreignField: '_id',
          as: 'activityData',
        },
      },
      {
        $unwind: '$activityData',
      },
      {
        $group: {
          _id: '$activityData.category',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Create PDF
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ilerleme-raporu-${period}-${Date.now()}.pdf"`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('İlerleme Raporu', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Dönem: ${period === 'week' ? 'Son 7 Gün' : period === 'month' ? 'Bu Ay' : 'Bu Yıl'}`, { align: 'center' });
    doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, { align: 'center' });
    doc.moveDown(2);

    // User Information
    doc.fontSize(16).text('Kullanıcı Bilgileri', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`İsim: ${clientProfile.firstName} ${clientProfile.lastName}`);
    doc.text(`E-posta: ${clientProfile.user.email}`);
    doc.moveDown();

    // Statistics
    doc.fontSize(16).text('İstatistikler', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Toplam Tamamlanan Aktivite: ${totalCompletions}`);
    doc.text(`Bu Dönemde Tamamlanan: ${completions.length}`);
    doc.text(`Toplam Rozet: ${totalBadges}`);
    doc.text(`Bu Dönemde Kazanılan Rozet: ${badges.length}`);
    doc.moveDown();

    // Category Statistics
    if (categoryStats.length > 0) {
      doc.fontSize(16).text('Kategori Dağılımı', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      categoryStats.forEach((stat: any) => {
        doc.text(`${stat._id || 'Belirtilmemiş'}: ${stat.count} aktivite`);
      });
      doc.moveDown();
    }

    // Recent Completions
    if (completions.length > 0) {
      doc.fontSize(16).text('Tamamlanan Aktiviteler', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      
      completions.slice(0, 20).forEach((completion: any) => {
        const activity = completion.activity;
        const date = new Date(completion.completedAt).toLocaleDateString('tr-TR');
        
        doc.text(`${activity?.title || 'Bilinmeyen Aktivite'}`, { continued: false });
        doc.text(`  Tarih: ${date}`, { indent: 20 });
        if (completion.rating) {
          doc.text(`  Değerlendirme: ${'⭐'.repeat(completion.rating)}`, { indent: 20 });
        }
        doc.moveDown(0.3);
      });

      if (completions.length > 20) {
        doc.moveDown();
        doc.text(`... ve ${completions.length - 20} aktivite daha`, { italic: true });
      }
      doc.moveDown();
    }

    // Recent Badges
    if (badges.length > 0) {
      doc.fontSize(16).text('Kazanılan Rozetler', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      
      badges.slice(0, 10).forEach((badge: any) => {
        const date = new Date(badge.earnedAt).toLocaleDateString('tr-TR');
        doc.text(`${badge.icon} ${badge.name}`, { continued: false });
        doc.text(`  Tarih: ${date}`, { indent: 20 });
        doc.text(`  ${badge.description}`, { indent: 20 });
        doc.moveDown(0.3);
      });

      if (badges.length > 10) {
        doc.moveDown();
        doc.text(`... ve ${badges.length - 10} rozet daha`, { italic: true });
      }
      doc.moveDown();
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text('Bu rapor KIEL-AI-FULL platformu tarafından otomatik olarak oluşturulmuştur.', {
      align: 'center',
      italic: true,
    });

    // Finalize PDF
    doc.end();
  } catch (error) {
    next(error);
  }
};

