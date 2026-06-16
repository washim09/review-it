// pages/api/reviews/my-affiliate.ts
// Returns the authenticated user's affiliate reviews with analytics
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { runCorsMiddleware } from '../../../lib/cors-middleware';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || '54b6b0d3a9a1d639b0797cac96e96623c832ca5952bcc12449604c98d59c08cf22edec3379e0203564346c68dc7e9dc16905e4328e3d65c7e6a53f743401dd44';

function getUserId(req: NextApiRequest): number | null {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.id || decoded.userId || null;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runCorsMiddleware(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const reviews = await prisma.review.findMany({
      where: {
        authorId: userId,
        affiliateEnabled: true,
      },
      select: {
        id: true,
        title: true,
        entity: true,
        affiliatePlatform: true,
        affiliateStatus: true,
        affiliateClickCount: true,
        affiliateSubmittedAt: true,
        affiliateVerifiedAt: true,
        affiliateNeedsChangesReason: true,
        affiliateRejectionReason: true,
      },
      orderBy: { affiliateSubmittedAt: 'desc' },
    });

    return res.status(200).json({ reviews });
  } catch (error) {
    console.error('Error fetching user affiliate reviews:', error);
    return res.status(500).json({ error: 'Failed to fetch affiliate reviews' });
  }
}
