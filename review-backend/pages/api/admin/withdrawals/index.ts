import { NextApiRequest, NextApiResponse } from 'next';
import { runCorsMiddleware } from '../../../../lib/cors-middleware';
import { prisma } from '../../../../lib/prisma';
import { getRequestAdminId } from '../../../../lib/rewardService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runCorsMiddleware(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const adminId = getRequestAdminId(req);
  if (!adminId) return res.status(401).json({ error: 'Unauthorized: Admin access required' });

  const status = typeof req.query.status === 'string' ? req.query.status : 'PENDING';
  const where = status === 'ALL' ? {} : { status };

  try {
    const withdrawals = await prisma.withdrawalRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isVerified: true,
            upiId: true,
            createdAt: true,
            _count: { select: { rewardFlags: { where: { status: 'OPEN' } } } },
          },
        },
      },
    });

    const userIds = withdrawals.map((row) => row.userId);
    const approvedCounts = userIds.length
      ? await prisma.review.groupBy({
          by: ['authorId'],
          where: { authorId: { in: userIds }, rewardStatus: 'APPROVED' },
          _count: { _all: true },
        })
      : [];
    const countByUser = new Map(approvedCounts.map((row) => [row.authorId, row._count._all]));

    return res.status(200).json({
      withdrawals: withdrawals.map((row) => ({
        ...row,
        approvedReviewCount: countByUser.get(row.userId) || 0,
        openFlagCount: row.user._count.rewardFlags,
      })),
    });
  } catch (error) {
    console.error('[Rewards] Withdrawal list failed:', error);
    return res.status(500).json({ error: 'Failed to load withdrawals' });
  }
}
