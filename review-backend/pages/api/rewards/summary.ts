import { NextApiRequest, NextApiResponse } from 'next';
import { runCorsMiddleware } from '../../../lib/cors-middleware';
import { RewardError, getRequestUserId, getRewardSummary } from '../../../lib/rewardService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runCorsMiddleware(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const userId = getRequestUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const summary = await getRewardSummary(userId);
    return res.status(200).json(summary);
  } catch (error) {
    if (error instanceof RewardError) return res.status(error.status).json({ error: error.message });
    console.error('[Rewards] Summary failed:', error);
    return res.status(500).json({ error: 'Failed to load rewards' });
  }
}
