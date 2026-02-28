import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import jwt from 'jsonwebtoken';
import { runCorsMiddleware } from '../../../lib/cors-middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runCorsMiddleware(req, res);
  
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = req.headers.authorization?.substring(7);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    const { subscription } = req.body;

    if (!subscription?.endpoint || !subscription?.keys) {
      return res.status(400).json({ error: 'Invalid subscription data' });
    }

    // Check if subscription already exists
    const existingSub = await prisma.pushSubscription.findFirst({
      where: {
        userId: decoded.userId,
        endpoint: subscription.endpoint
      }
    });

    let sub;
    if (existingSub) {
      // Update existing subscription
      sub = await prisma.pushSubscription.update({
        where: { id: existingSub.id },
        data: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          isActive: true,
          userAgent: req.headers['user-agent'] || null
        }
      });
    } else {
      // Create new subscription
      sub = await prisma.pushSubscription.create({
        data: {
          userId: decoded.userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userAgent: req.headers['user-agent'] || null
        }
      });
    }

    return res.status(200).json({ success: true, subscription: sub });
  } catch (error: any) {
    console.error('Subscribe error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      userId: req.body?.userId
    });
    return res.status(500).json({ 
      error: 'Failed to subscribe',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}