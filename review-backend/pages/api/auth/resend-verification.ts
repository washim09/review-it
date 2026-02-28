// API endpoint to resend email verification
import { NextApiRequest, NextApiResponse } from 'next';
import { resendVerificationEmailHandler } from '../../../controllers/emailVerificationController';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return await resendVerificationEmailHandler(req, res);
}
