import { NextApiRequest, NextApiResponse } from 'next';
import { runCorsMiddleware } from '../../../../lib/cors-middleware';
import { prisma } from '../../../../lib/prisma';
import { RewardError, adminDecideWithdrawal, getRequestAdminId } from '../../../../lib/rewardService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runCorsMiddleware(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const adminId = getRequestAdminId(req);
  if (!adminId) return res.status(401).json({ error: 'Unauthorized: Admin access required' });

  const withdrawalId = Number(req.query.id);
  if (!Number.isInteger(withdrawalId) || withdrawalId <= 0) {
    return res.status(400).json({ error: 'Invalid withdrawal id' });
  }

  if (req.method === 'GET') {
    try {
      const withdrawal = await prisma.withdrawalRequest.findUnique({
        where: { id: withdrawalId },
        include: { user: { select: { id: true, name: true, email: true, isVerified: true, upiId: true, createdAt: true } } },
      });
      if (!withdrawal) return res.status(404).json({ error: 'Withdrawal request not found' });

      const [reviews, flags, ledger] = await Promise.all([
        prisma.review.findMany({
          where: { authorId: withdrawal.userId },
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            title: true,
            content: true,
            rating: true,
            rewardStatus: true,
            affiliateEnabled: true,
            affiliateStatus: true,
            aiSpamScore: true,
            createdAt: true,
          },
        }),
        prisma.rewardFlag.findMany({
          where: { userId: withdrawal.userId },
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
        prisma.rewardLedger.findMany({
          where: { userId: withdrawal.userId },
          orderBy: { createdAt: 'desc' },
          take: 30,
        }),
      ]);

      return res.status(200).json({ withdrawal, reviews, flags, ledger });
    } catch (error) {
      console.error('[Rewards] Withdrawal detail failed:', error);
      return res.status(500).json({ error: 'Failed to load withdrawal' });
    }
  }

  if (req.method === 'PUT') {
    const action = req.body?.action;
    if (action !== 'APPROVE' && action !== 'REJECT' && action !== 'PAY') {
      return res.status(400).json({ error: 'Action must be APPROVE, REJECT, or PAY' });
    }
    try {
      await adminDecideWithdrawal(withdrawalId, adminId, action, req.body?.reason);
      return res.status(200).json({ message: action === 'PAY' ? 'Withdrawal marked as paid' : action === 'APPROVE' ? 'Withdrawal approved' : 'Withdrawal rejected' });
    } catch (error) {
      if (error instanceof RewardError) return res.status(error.status).json({ error: error.message });
      console.error('[Rewards] Withdrawal decision failed:', error);
      return res.status(500).json({ error: 'Failed to update withdrawal' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
