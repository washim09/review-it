import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Google OAuth2 client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/google/callback`
);

// Generate Google OAuth URL
export const getGoogleAuthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
};

// Handle Google OAuth callback
export const handleGoogleCallback = async (code: string) => {
  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    if (!googleUser.email) {
      throw new Error('No email found in Google profile');
    }

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email }
    });

    if (user) {
      // Update existing user with Google info if not already set
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.id,
            profileImage: googleUser.picture || user.profileImage || user.imageUrl,
            isVerified: true
          }
        });
      }
    } else {
      // Create new user from Google profile
      user = await prisma.user.create({
        data: {
          name: googleUser.name || 'Google User',
          email: googleUser.email,
          googleId: googleUser.id,
          profileImage: googleUser.picture,
          imageUrl: googleUser.picture,
          isVerified: true,
          // Password is optional for OAuth users
          password: null
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,  // Use 'userId' to match existing profile API
        id: user.id,      // Keep 'id' for compatibility
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        imageUrl: user.profileImage || user.imageUrl,
        profileImage: user.profileImage || user.imageUrl
      }
    };

  } catch (error) {
    console.error('Google OAuth error:', error);
    return {
      success: false,
      error: 'Failed to authenticate with Google'
    };
  }
};
