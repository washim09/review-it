// pages/api/admin/affiliate-reviews/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { runCorsMiddleware } from '../../../../lib/cors-middleware';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || '54b6b0d3a9a1d639b0797cac96e96623c832ca5952bcc12449604c98d59c08cf22edec3379e0203564346c68dc7e9dc16905e4328e3d65c7e6a53f743401dd44';

// Verify admin token
function verifyAdminToken(req: NextApiRequest): { adminId: number } | null {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin' && !decoded.adminId) return null;
    return { adminId: decoded.adminId || decoded.id };
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runCorsMiddleware(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Admin authentication required
  const admin = verifyAdminToken(req);
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized: Admin access required' });
  }

  if (req.method === 'GET') {
    try {
      const {
        status,
        platform,
        search,
        page = '1',
        limit = '20',
        sortBy = 'affiliateSubmittedAt',
        sortOrder = 'desc',
        minScore,
        maxScore,
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where: any = {
        affiliateEnabled: true,
      };

      // Filter by status
      if (status && status !== 'all') {
        where.affiliateStatus = status as string;
      }

      // Filter by platform
      if (platform && platform !== 'all') {
        where.affiliatePlatform = platform as string;
      }

      // Search by title, entity, or author name
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { entity: { contains: search as string, mode: 'insensitive' } },
          { author: { name: { contains: search as string, mode: 'insensitive' } } },
        ];
      }

      // Filter by AI spam score range
      if (minScore) {
        where.aiSpamScore = { ...where.aiSpamScore, gte: parseFloat(minScore as string) };
      }
      if (maxScore) {
        where.aiSpamScore = { ...where.aiSpamScore, lte: parseFloat(maxScore as string) };
      }

      // Build orderBy
      const orderBy: any = {};
      orderBy[sortBy as string] = sortOrder as string;

      // Fetch reviews
      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where,
          skip,
          take: limitNum,
          orderBy,
          select: {
            id: true,
            title: true,
            entity: true,
            content: true,
            review: true,
            rating: true,
            category: true,
            tags: true,
            imageUrl: true,
            videoUrl: true,
            mediaUrls: true,
            createdAt: true,
            affiliateEnabled: true,
            affiliatePlatform: true,
            affiliateLink: true,
            affiliateStatus: true,
            aiSpamScore: true,
            aiSpamReasons: true,
            affiliateSubmittedAt: true,
            affiliateVerifiedBy: true,
            affiliateVerifiedAt: true,
            affiliateNeedsChangesReason: true,
            affiliateRejectionReason: true,
            affiliateClickCount: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        }),
        prisma.review.count({ where }),
      ]);

      // Get status counts for dashboard
      const [pendingCount, approvedCount, rejectedCount, needsChangesCount] = await Promise.all([
        prisma.review.count({ where: { affiliateEnabled: true, affiliateStatus: 'PENDING_VERIFICATION' } }),
        prisma.review.count({ where: { affiliateEnabled: true, affiliateStatus: { in: ['APPROVED', 'AUTO_APPROVED'] } } }),
        prisma.review.count({ where: { affiliateEnabled: true, affiliateStatus: { in: ['REJECTED', 'AUTO_REJECTED'] } } }),
        prisma.review.count({ where: { affiliateEnabled: true, affiliateStatus: 'NEEDS_CHANGES' } }),
      ]);

      return res.status(200).json({
        reviews,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
        stats: {
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          needsChanges: needsChangesCount,
        },
      });
    } catch (error) {
      console.error('Error fetching affiliate reviews:', error);
      return res.status(500).json({ error: 'Failed to fetch affiliate reviews' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
