import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const totalSubscribers = await prisma.emailSubscription.count({
        where: { isActive: true }
      });

      const recentSubscribers = await prisma.emailSubscription.count({
        where: {
          isActive: true,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      });

      const lastEmailSent = await prisma.emailSubscription.findFirst({
        where: {
          isActive: true,
          lastEmailSent: { not: null }
        },
        orderBy: {
          lastEmailSent: 'desc'
        },
        select: {
          lastEmailSent: true
        }
      });

      return res.status(200).json({
        totalSubscribers,
        recentSubscribers,
        lastEmailSent: lastEmailSent?.lastEmailSent || null
      });

    } catch (error) {
      console.error('Stats error:', error);
      return res.status(500).json({ error: 'Failed to get newsletter stats' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
