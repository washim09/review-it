import { NextApiRequest, NextApiResponse } from 'next';
import { runCorsMiddleware } from '../../../../lib/cors-middleware';
import { prisma } from '../../../../lib/prisma';
import { RewardError, clearUserFlags, getRequestAdminId } from '../../../../lib/rewardService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runCorsMiddleware(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const adminId = getRequestAdminId(req);
  if (!adminId) return res.status(401).json({ error: 'Unauthorized: Admin access required' });

  if (req.method === 'GET') {
    try {
      const status = typeof req.query.status === 'string' ? req.query.status : 'FLAGGED';
      const whereStatus = status === 'ALL' ? { in: ['FLAGGED', 'PENDING', 'REJECTED', 'APPROVED'] } : status;
      const [reviews, flags] = await Promise.all([
        prisma.review.findMany({
          where: { rewardStatus: whereStatus },
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: {
            id: true,
            title: true,
            content: true,
            review: true,
            rating: true,
            rewardStatus: true,
            affiliateEnabled: true,
            affiliateStatus: true,
            aiSpamScore: true,
            createdAt: true,
            author: { select: { id: true, name: true, email: true, isVerified: true, createdAt: true } },
          },
        }),
        prisma.rewardFlag.findMany({
          where: { status: 'OPEN' },
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { user: { select: { id: true, name: true, email: true } } },
        }),
      ]);
      return res.status(200).json({ reviews, flags });
    } catch (error) {
      console.error('[Rewards] Admin queue failed:', error);
      return res.status(500).json({ error: 'Failed to load reward reviews' });
    }
  }

  if (req.method === 'PUT') {
    try {
      if (req.body?.action !== 'CLEAR_FLAGS') {
        return res.status(400).json({ error: 'Use the review route to approve or reject a reward.' });
      }
      const userId = Number(req.body.userId);
      if (!Number.isInteger(userId) || userId <= 0) return res.status(400).json({ error: 'A user id is required.' });
      await clearUserFlags(userId, adminId);
      return res.status(200).json({ message: 'Open flags cleared. Flagged reviews still need individual approval before they earn a reward.' });
    } catch (error) {
      if (error instanceof RewardError) return res.status(error.status).json({ error: error.message });
      console.error('[Rewards] Clear flags failed:', error);
      return res.status(500).json({ error: 'Failed to clear flags' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
