// pages/api/admin/link-health/index.ts
// GET: Fetch link health status for all approved affiliate reviews
// POST: Trigger a health check run on all approved affiliate links
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { runCorsMiddleware } from '../../../../lib/cors-middleware';
import { checkLinkHealth } from '../../../../lib/linkHealthChecker';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || '54b6b0d3a9a1d639b0797cac96e96623c832ca5952bcc12449604c98d59c08cf22edec3379e0203564346c68dc7e9dc16905e4328e3d65c7e6a53f743401dd44';

function getAdminId(req: NextApiRequest): number | null {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return null;
    return decoded.id || decoded.userId || null;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runCorsMiddleware(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const adminId = getAdminId(req);
  if (!adminId) return res.status(401).json({ error: 'Admin access required' });

  // GET - List all approved affiliate reviews with their health status
  if (req.method === 'GET') {
    try {
      const { filter } = req.query; // all | healthy | broken | unchecked

      const where: any = {
        affiliateEnabled: true,
        affiliateStatus: { in: ['APPROVED', 'AUTO_APPROVED'] },
      };

      if (filter === 'broken') {
        where.affiliateLinkHealth = 'BROKEN';
      } else if (filter === 'healthy') {
        where.affiliateLinkHealth = 'HEALTHY';
      } else if (filter === 'unchecked') {
        where.affiliateLinkLastCheckedAt = null;
      }

      const reviews = await prisma.review.findMany({
        where,
        select: {
          id: true,
          title: true,
          entity: true,
          affiliateLink: true,
          affiliatePlatform: true,
          affiliateLinkHealth: true,
          affiliateLinkLastCheckedAt: true,
          affiliateLinkHttpStatus: true,
          affiliateClickCount: true,
          author: { select: { id: true, name: true, email: true } },
        },
        orderBy: [
          { affiliateLinkHealth: 'asc' },
          { affiliateLinkLastCheckedAt: 'asc' },
        ],
      });

      const stats = {
        total: reviews.length,
        healthy: reviews.filter(r => r.affiliateLinkHealth === 'HEALTHY').length,
        broken: reviews.filter(r => r.affiliateLinkHealth === 'BROKEN').length,
        unknown: reviews.filter(r => r.affiliateLinkHealth === 'UNKNOWN' || r.affiliateLinkHealth === 'REDIRECT_CHANGED').length,
        unchecked: reviews.filter(r => !r.affiliateLinkLastCheckedAt).length,
      };

      return res.status(200).json({ reviews, stats });
    } catch (error) {
      console.error('[LinkHealth] GET error:', error);
      return res.status(500).json({ error: 'Failed to fetch link health data' });
    }
  }

  // POST - Run health checks on approved affiliate links
  if (req.method === 'POST') {
    try {
      const reviews = await prisma.review.findMany({
        where: {
          affiliateEnabled: true,
          affiliateStatus: { in: ['APPROVED', 'AUTO_APPROVED'] },
          affiliateLink: { not: null },
        },
        select: { id: true, affiliateLink: true },
      });

      const results = [];
      // Process sequentially to avoid overwhelming target servers
      for (const review of reviews) {
        if (!review.affiliateLink) continue;

        const result = await checkLinkHealth(review.affiliateLink);

        await prisma.review.update({
          where: { id: review.id },
          data: {
            affiliateLinkHealth: result.health,
            affiliateLinkLastCheckedAt: new Date(),
            affiliateLinkHttpStatus: result.httpStatus,
          },
        });

        results.push({
          reviewId: review.id,
          url: review.affiliateLink,
          ...result,
        });
      }

      const summary = {
        total: results.length,
        healthy: results.filter(r => r.health === 'HEALTHY').length,
        broken: results.filter(r => r.health === 'BROKEN').length,
        unknown: results.filter(r => r.health === 'UNKNOWN' || r.health === 'REDIRECT_CHANGED').length,
      };

      return res.status(200).json({
        success: true,
        message: `Checked ${results.length} links`,
        summary,
        results,
      });
    } catch (error) {
      console.error('[LinkHealth] POST error:', error);
      return res.status(500).json({ error: 'Failed to run health checks' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
