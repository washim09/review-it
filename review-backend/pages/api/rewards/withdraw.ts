import { NextApiRequest, NextApiResponse } from 'next';
import { runCorsMiddleware } from '../../../lib/cors-middleware';
import { RewardError, getRequestUserId, requestWithdrawal } from '../../../lib/rewardService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runCorsMiddleware(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const userId = getRequestUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const rawAmount = req.body?.amount;
  const clientAmount = rawAmount === undefined || rawAmount === null || rawAmount === ''
    ? null
    : Number(rawAmount);
  if (clientAmount != null && (!Number.isInteger(clientAmount) || clientAmount <= 0)) {
    return res.status(400).json({ error: 'Withdrawal amount must be a whole number of rupees.' });
  }

  try {
    const withdrawal = await requestWithdrawal(userId, clientAmount);
    return res.status(201).json({
      message: 'Withdrawal request received. If it is approved, payment is expected within 24 hours.',
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        status: withdrawal.status,
        upiId: withdrawal.upiId,
      },
    });
  } catch (error) {
    if (error instanceof RewardError) return res.status(error.status).json({ error: error.message });
    console.error('[Rewards] Withdrawal failed:', error);
    return res.status(500).json({ error: 'Failed to request withdrawal' });
  }
}
