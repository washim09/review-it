// API endpoint to verify email with token
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyEmailHandler } from '../../../controllers/emailVerificationController';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return await verifyEmailHandler(req, res);
}
