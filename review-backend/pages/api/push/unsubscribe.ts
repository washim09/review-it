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

    await prisma.pushSubscription.updateMany({
      where: { userId: decoded.userId, isActive: true },
      data: { isActive: false }
    });

    return res.status(200).json({ success: true, message: 'Unsubscribed from push notifications' });
  } catch (error: any) {
    console.error('Unsubscribe error:', error);
    return res.status(500).json({ 
      error: 'Failed to unsubscribe',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}