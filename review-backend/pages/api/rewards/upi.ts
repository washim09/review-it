import { NextApiRequest, NextApiResponse } from 'next';
import { runCorsMiddleware } from '../../../lib/cors-middleware';
import { RewardError, getRequestUserId, saveUpi } from '../../../lib/rewardService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runCorsMiddleware(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  const userId = getRequestUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const upiId = typeof req.body?.upiId === 'string' ? req.body.upiId : '';
  try {
    const saved = await saveUpi(userId, upiId);
    return res.status(200).json({ message: 'UPI ID saved', ...saved });
  } catch (error) {
    if (error instanceof RewardError) return res.status(error.status).json({ error: error.message });
    console.error('[Rewards] UPI save failed:', error);
    return res.status(500).json({ error: 'Failed to save UPI ID' });
  }
}
