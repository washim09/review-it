import { NextApiRequest, NextApiResponse } from 'next';
import { getGoogleAuthUrl } from '../../../lib/googleOAuth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Generate Google OAuth URL and redirect
    const authUrl = getGoogleAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to initiate Google OAuth' 
    });
  }
}
