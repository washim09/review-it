import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import jwt from 'jsonwebtoken';
import { runCorsMiddleware } from '../../../lib/cors-middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await runCorsMiddleware(req, res);
  } catch (error) {
    return res.status(500).json({ message: 'CORS configuration error' });
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };

    const {
      imageUrl,
      contact,
      dob,
      gender,
      address,
      city,
      state,
      instagram,
      facebook,
      twitter,
    } = req.body;

    // Build update data - only include fields that are provided
    const updateData: Record<string, any> = {
      profileCompleted: true,
    };

    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (contact !== undefined) updateData.contact = contact;
    if (dob !== undefined) updateData.dob = dob ? new Date(dob) : null;
    if (gender !== undefined) updateData.gender = gender;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (instagram !== undefined) updateData.instagram = instagram;
    if (facebook !== undefined) updateData.facebook = facebook;
    if (twitter !== undefined) updateData.twitter = twitter;

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        profileImage: true,
        contact: true,
        dob: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        instagram: true,
        facebook: true,
        twitter: true,
        isVerified: true,
        profileCompleted: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
}
