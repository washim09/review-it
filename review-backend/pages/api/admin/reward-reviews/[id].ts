import { NextApiRequest, NextApiResponse } from 'next';
import { runCorsMiddleware } from '../../../../lib/cors-middleware';
import { RewardError, adminDecideReward, getRequestAdminId } from '../../../../lib/rewardService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runCorsMiddleware(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  const adminId = getRequestAdminId(req);
  if (!adminId) return res.status(401).json({ error: 'Unauthorized: Admin access required' });

  const reviewId = Number(req.query.id);
  if (!Number.isInteger(reviewId) || reviewId <= 0) return res.status(400).json({ error: 'Invalid review id' });

  const action = req.body?.action;
  if (action !== 'APPROVE' && action !== 'REJECT') {
    return res.status(400).json({ error: 'Action must be APPROVE or REJECT' });
  }

  try {
    await adminDecideReward(reviewId, adminId, action, req.body?.reason);
    return res.status(200).json({ message: action === 'APPROVE' ? 'Reward approved' : 'Reward rejected' });
  } catch (error) {
    if (error instanceof RewardError) return res.status(error.status).json({ error: error.message });
    console.error('[Rewards] Reward decision failed:', error);
    return res.status(500).json({ error: 'Failed to update reward' });
  }
}
