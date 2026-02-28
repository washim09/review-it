import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import Cors from 'cors';
import initMiddleware from '../../../middleware/initMiddleware';
import bcrypt from 'bcryptjs';

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
    const { token, password, confirmPassword } = req.body;

    // Validate the input
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Passwords do not match' 
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Find the reset token
    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      select: {
        id: true,
        email: true,
        expiresAt: true,
        used: true
      }
    });

    // Check if token exists
    if (!resetTokenRecord) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired reset token' 
      });
    }

    // Check if token is already used
    if (resetTokenRecord.used) {
      return res.status(400).json({ 
        success: false,
        message: 'This reset link has already been used' 
      });
    }

    // Check if token is expired
    if (new Date() > resetTokenRecord.expiresAt) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({
        where: { token }
      });
      
      return res.status(400).json({ 
        success: false,
        message: 'Reset token has expired. Please request a new password reset.' 
      });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: resetTokenRecord.email },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user's password and mark token as used
    await prisma.$transaction([
      // Update user password
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      }),
      // Mark token as used
      prisma.passwordResetToken.update({
        where: { token },
        data: { used: true }
      })
    ]);

    // Clean up old/expired tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { 
        email: resetTokenRecord.email,
        OR: [
          { used: true },
          { expiresAt: { lt: new Date() } }
        ]
      }
    });

    return res.status(200).json({ 
      success: true,
      message: 'Password has been successfully reset. You can now log in with your new password.' 
    });
    
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ 
      success: false,
      message: 'An error occurred while resetting your password' 
    });
  }
}
