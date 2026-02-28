// Email verification controller for user registration
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../lib/prisma';
import jwt from 'jsonwebtoken';
import EmailService from '../lib/emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Generate email verification token
export const generateVerificationToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email, type: 'email_verification' },
    JWT_SECRET,
    { expiresIn: '24h' } // Token expires in 24 hours
  );
};

// Send verification email
export const sendVerificationEmailHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ message: 'User ID and email are required' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken(userId, email);

    // Update user with verification token
    await prisma.user.update({
      where: { id: userId },
      data: { 
        verificationToken,
        verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

    // Send verification email
    await EmailService.sendVerificationEmail(email, user.name, verificationToken);

    res.status(200).json({ 
      message: 'Verification email sent successfully',
      expiresIn: '24 hours'
    });
  } catch (error) {
    console.error('Send verification email error:', error);
    res.status(500).json({ message: 'Failed to send verification email' });
  }
};

// Verify email with token
export const verifyEmailHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Verify and decode token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    if (decoded.type !== 'email_verification') {
      return res.status(400).json({ message: 'Invalid token type' });
    }

    // Find user with verification token
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        email: decoded.email,
        verificationToken: token,
        verificationTokenExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
        emailVerifiedAt: new Date()
      }
    });

    // Redirect to landing page after successful verification
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/?verified=true&message=Email verified successfully!`;
    
    // Send HTML redirect page
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verified - ⭐ Riviewit</title>
        <meta http-equiv="refresh" content="0; url=${redirectUrl}">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 2rem;
          }
          .spinner {
            border: 4px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top: 4px solid white;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <h2>✅ Email Verified Successfully!</h2>
          <p>Redirecting you to ⭐ Riviewit...</p>
          <p><a href="${redirectUrl}" style="color: white;">Click here if not redirected automatically</a></p>
        </div>
        <script>
          setTimeout(() => {
            window.location.href = '${redirectUrl}';
          }, 1000);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Email verification error:', error);
    // Redirect to landing page with error message
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/?verified=false&message=Email verification failed. Please try again.`;
    
    // Send HTML redirect page for errors
    res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verification Failed - ⭐ Riviewit</title>
        <meta http-equiv="refresh" content="0; url=${redirectUrl}">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 2rem;
          }
          .spinner {
            border: 4px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top: 4px solid white;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <h2>❌ Email Verification Failed</h2>
          <p>Redirecting you to ⭐ Riviewit...</p>
          <p><a href="${redirectUrl}" style="color: white;">Click here if not redirected automatically</a></p>
        </div>
        <script>
          setTimeout(() => {
            window.location.href = '${redirectUrl}';
          }, 1000);
        </script>
      </body>
      </html>
    `);
  }
};

// Resend verification email
export const resendVerificationEmailHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Check rate limiting (prevent spam)
    const lastVerificationSent = user.verificationTokenExpires;
    if (lastVerificationSent && new Date().getTime() - lastVerificationSent.getTime() < 5 * 60 * 1000) {
      return res.status(429).json({ 
        message: 'Please wait 5 minutes before requesting another verification email' 
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken(user.id.toString(), email);

    // Update user with new verification token
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        verificationToken,
        verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

    // Send verification email
    await EmailService.sendVerificationEmail(email, user.name, verificationToken);

    res.status(200).json({ 
      message: 'Verification email resent successfully',
      expiresIn: '24 hours'
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({ message: 'Failed to resend verification email' });
  }
};
