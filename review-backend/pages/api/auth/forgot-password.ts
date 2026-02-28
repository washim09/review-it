import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { EmailService } from '../../../lib/emailService';
import Cors from 'cors';
import initMiddleware from '../../../middleware/initMiddleware';
import crypto from 'crypto';

// Initialize CORS middleware
const cors = initMiddleware(
  Cors({
    methods: ['POST', 'OPTIONS'],
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'],
    credentials: true,
  })
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run CORS middleware
  await cors(req, res);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    // Validate the input
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email address is required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a valid email address' 
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true }
    });

    // For security, we always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {

      return res.status(200).json({ 
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.' 
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Clean up any existing unused tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { 
        email: email.toLowerCase(),
        OR: [
          { used: true },
          { expiresAt: { lt: new Date() } }
        ]
      }
    });

    // Store the reset token
    await prisma.passwordResetToken.create({
      data: {
        email: email.toLowerCase(),
        token: resetToken,
        expiresAt,
        used: false
      }
    });

    // Send password reset email (don't wait for completion to avoid blocking)
    EmailService.sendPasswordResetEmail(
      email.toLowerCase(),
      user.name,
      resetToken
    ).then((sent) => {

    }).catch((error) => {
      console.error(`❌ Error sending password reset email for ${email}:`, error);
    });

    return res.status(200).json({ 
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.' 
    });
    
  } catch (error) {
    console.error('Error processing password reset request:', error);
    return res.status(500).json({ 
      success: false,
      message: 'An error occurred while processing your request' 
    });
  }
}
