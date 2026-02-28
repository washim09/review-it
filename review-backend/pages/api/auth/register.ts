// Updated registration API endpoint with comprehensive security features and CORS
import { NextApiRequest, NextApiResponse } from 'next';
import { register } from '../../../controllers/authController';
import { runCorsMiddleware } from '../../../lib/cors-middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply CORS middleware first
  try {
    await runCorsMiddleware(req, res);
  } catch (error) {
    return res.status(500).json({ message: 'CORS configuration error' });
  }

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Use the enhanced registration controller with all security features
  return await register(req, res);
}