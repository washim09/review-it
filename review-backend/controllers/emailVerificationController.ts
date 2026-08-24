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
      return res.status(400).json({ success: false, message: 'User ID and email are required' });
    }

    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: numericUserId }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken(numericUserId.toString(), email);

    // Update user with verification token
    await prisma.user.update({
      where: { id: numericUserId },
      data: { 
        verificationToken,
        verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

    // Send verification email
    const emailSent = await EmailService.sendVerificationEmail(email, user.name, verificationToken);

    if (!emailSent) {
      return res.status(500).json({ success: false, message: 'Failed to send verification email. Please try again later.' });
    }

    res.status(200).json({ 
      success: true,
      message: 'Verification email sent successfully',
      expiresIn: '24 hours'
    });
  } catch (error) {
    console.error('Send verification email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send verification email' });
  }
};

// Verify email with token (supports GET with ?token= from the email link/frontend page, and POST with token in body)
export const verifyEmailHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const token = req.method === 'GET'
      ? (Array.isArray(req.query.token) ? req.query.token[0] : req.query.token)
      : req.body?.token;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required' });
    }

    // Verify and decode token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    if (decoded.type !== 'email_verification') {
      return res.status(400).json({ success: false, message: 'Invalid token type' });
    }

    const userId = parseInt(decoded.userId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid verification token' });
    }

    // Find the user the token was issued for
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        email: decoded.email
      }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    // Treat an already-verified account as success (e.g. the link was clicked twice)
    if (user.isVerified) {
      return res.status(200).json({ success: true, message: 'Email is already verified. You can log in.' });
    }

    if (user.verificationToken !== token || !user.verificationTokenExpires || user.verificationTokenExpires <= new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
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

    // The frontend /verify-email page consumes this JSON and redirects to login
    res.status(200).json({ success: true, message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ success: false, message: 'Email verification failed. Please try again.' });
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
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    // Check rate limiting (prevent spam)
    // The token expires 24h after it was sent, so the last send time is expiry minus 24h
    if (user.verificationTokenExpires) {
      const lastVerificationSent = user.verificationTokenExpires.getTime() - 24 * 60 * 60 * 1000;
      if (Date.now() - lastVerificationSent < 5 * 60 * 1000) {
        return res.status(429).json({ 
          success: false,
          message: 'Please wait 5 minutes before requesting another verification email' 
        });
      }
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
    const emailSent = await EmailService.sendVerificationEmail(email, user.name, verificationToken);

    if (!emailSent) {
      return res.status(500).json({ success: false, message: 'Failed to send verification email. Please try again later.' });
    }

    res.status(200).json({ 
      success: true,
      message: 'Verification email resent successfully',
      expiresIn: '24 hours'
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({ success: false, message: 'Failed to resend verification email' });
  }
};
