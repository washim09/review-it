// API endpoint to send email verification
import { NextApiRequest, NextApiResponse } from 'next';
import { sendVerificationEmailHandler } from '../../../controllers/emailVerificationController';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return await sendVerificationEmailHandler(req, res);
}
