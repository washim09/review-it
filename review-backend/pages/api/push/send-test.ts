import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import jwt from 'jsonwebtoken';
import { runCorsMiddleware } from '../../../lib/cors-middleware';
import { sendPushNotification } from '../../../utils/pushNotifications';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runCorsMiddleware(req, res);
  
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.substring(7);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    
    // Check if user has active subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { 
        userId: decoded.userId,
        isActive: true 
      }
    });

    if (subscriptions.length === 0) {
      return res.status(404).json({ 
        error: 'No active subscriptions found',
        message: 'Please enable notifications first'
      });
    }

    // Send test notification
    const result = await sendPushNotification(decoded.userId, {
      title: 'Test Notification',
      body: 'This is a test notification from Riviewit! 🎉',
      icon: '/icons/web-app-manifest-192x192.png',
      data: {
        url: '/profile',
        timestamp: new Date().toISOString()
      }
    });

    return res.status(200).json({ 
      success: result.success,
      message: 'Test notification sent',
      sentCount: result.sentCount,
      failedCount: result.failedCount,
      totalSubscriptions: subscriptions.length
    });
  } catch (error: any) {
    console.error('Send test error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ 
      error: 'Failed to send test notification',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
