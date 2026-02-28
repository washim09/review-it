import { NextApiRequest, NextApiResponse } from 'next';
import { handleGoogleCallback } from '../../../../lib/googleOAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code, error } = req.query;

  // Handle OAuth errors
  if (error) {
    console.error('Google OAuth error:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_error`);
  }

  // Handle missing authorization code
  if (!code || typeof code !== 'string') {
    console.error('No authorization code received');
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=missing_code`);
  }

  try {
    // Process Google OAuth callback
    const result = await handleGoogleCallback(code);

    if (result.success) {
      // Redirect to frontend with token and user data
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const userData = encodeURIComponent(JSON.stringify(result.user));
      
      res.redirect(`${frontendUrl}/auth/callback?token=${result.token}&user=${userData}`);
    } else {
      // Redirect with error
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=server_error`);
  }
}
