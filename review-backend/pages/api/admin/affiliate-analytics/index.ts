// pages/api/admin/affiliate-analytics/index.ts
// Admin dashboard analytics for the affiliate system
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { runCorsMiddleware } from '../../../../lib/cors-middleware';

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
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const adminId = getAdminId(req);
  if (!adminId) return res.status(401).json({ error: 'Admin access required' });

  try {
    // Fetch all affiliate reviews
    const allAffiliateReviews = await prisma.review.findMany({
      where: { affiliateEnabled: true },
      select: {
        id: true,
        title: true,
        entity: true,
        affiliatePlatform: true,
        affiliateStatus: true,
        affiliateClickCount: true,
        affiliateSubmittedAt: true,
        affiliateVerifiedAt: true,
        createdAt: true,
        author: { select: { id: true, name: true, email: true } },
      },
    });

    // Overview stats
    const totalReviews = allAffiliateReviews.length;
    const approved = allAffiliateReviews.filter(r => r.affiliateStatus === 'APPROVED' || r.affiliateStatus === 'AUTO_APPROVED');
    const pending = allAffiliateReviews.filter(r => r.affiliateStatus === 'PENDING_VERIFICATION');
    const rejected = allAffiliateReviews.filter(r => r.affiliateStatus === 'REJECTED' || r.affiliateStatus === 'AUTO_REJECTED');
    const needsChanges = allAffiliateReviews.filter(r => r.affiliateStatus === 'NEEDS_CHANGES');
    const totalClicks = allAffiliateReviews.reduce((sum, r) => sum + r.affiliateClickCount, 0);

    // Platform breakdown
    const platformStats: Record<string, { count: number; clicks: number; approved: number }> = {};
    for (const r of allAffiliateReviews) {
      const p = r.affiliatePlatform || 'UNKNOWN';
      if (!platformStats[p]) platformStats[p] = { count: 0, clicks: 0, approved: 0 };
      platformStats[p].count++;
      platformStats[p].clicks += r.affiliateClickCount;
      if (r.affiliateStatus === 'APPROVED' || r.affiliateStatus === 'AUTO_APPROVED') {
        platformStats[p].approved++;
      }
    }

    // Top performers (by clicks)
    const topPerformers = [...approved]
      .sort((a, b) => b.affiliateClickCount - a.affiliateClickCount)
      .slice(0, 10)
      .map(r => ({
        id: r.id,
        title: r.title,
        entity: r.entity,
        platform: r.affiliatePlatform,
        clicks: r.affiliateClickCount,
        author: r.author,
      }));

    // Top reviewers (aggregate clicks per author)
    const reviewerMap: Record<number, { name: string; email: string; reviews: number; clicks: number }> = {};
    for (const r of approved) {
      const aid = r.author.id;
      if (!reviewerMap[aid]) {
        reviewerMap[aid] = { name: r.author.name, email: r.author.email, reviews: 0, clicks: 0 };
      }
      reviewerMap[aid].reviews++;
      reviewerMap[aid].clicks += r.affiliateClickCount;
    }
    const topReviewers = Object.entries(reviewerMap)
      .map(([id, data]) => ({ id: Number(id), ...data }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    // Monthly submission trend (last 6 months)
    const now = new Date();
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthReviews = allAffiliateReviews.filter(r => {
        const d = new Date(r.createdAt);
        return d >= month && d < nextMonth;
      });
      monthlyTrend.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        submissions: monthReviews.length,
        clicks: monthReviews.reduce((s, r) => s + r.affiliateClickCount, 0),
      });
    }

    return res.status(200).json({
      overview: {
        totalReviews,
        approved: approved.length,
        pending: pending.length,
        rejected: rejected.length,
        needsChanges: needsChanges.length,
        totalClicks,
        avgClicksPerReview: approved.length > 0 ? Math.round(totalClicks / approved.length) : 0,
      },
      platformStats,
      topPerformers,
      topReviewers,
      monthlyTrend,
    });
  } catch (error) {
    console.error('[AffiliateAnalytics] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}
