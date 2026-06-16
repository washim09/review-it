// pages/api/notifications/index.ts
// Get and manage user notifications
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { runCorsMiddleware } from '../../../lib/cors-middleware';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || '54b6b0d3a9a1d639b0797cac96e96623c832ca5952bcc12449604c98d59c08cf22edec3379e0203564346c68dc7e9dc16905e4328e3d65c7e6a53f743401dd44';

function getUserId(req: NextApiRequest): number | null {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.id || decoded.userId || null;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runCorsMiddleware(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // GET - Fetch user's notifications
  if (req.method === 'GET') {
    try {
      const { unreadOnly, limit = '20', page = '1' } = req.query;
      const limitNum = parseInt(limit as string, 10);
      const pageNum = parseInt(page as string, 10);

      const where: any = { userId };
      if (unreadOnly === 'true') {
        where.isRead = false;
      }

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({ where: { userId, isRead: false } }),
      ]);

      return res.status(200).json({
        notifications,
        unreadCount,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  // PUT - Mark notifications as read
  if (req.method === 'PUT') {
    try {
      const { notificationIds, markAllRead } = req.body;

      if (markAllRead) {
        await prisma.notification.updateMany({
          where: { userId, isRead: false },
          data: { isRead: true },
        });
        return res.status(200).json({ success: true, message: 'All notifications marked as read' });
      }

      if (Array.isArray(notificationIds) && notificationIds.length > 0) {
        await prisma.notification.updateMany({
          where: { id: { in: notificationIds }, userId },
          data: { isRead: true },
        });
        return res.status(200).json({ success: true, message: 'Notifications marked as read' });
      }

      return res.status(400).json({ error: 'Provide notificationIds array or markAllRead: true' });
    } catch (error) {
      console.error('Error updating notifications:', error);
      return res.status(500).json({ error: 'Failed to update notifications' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
