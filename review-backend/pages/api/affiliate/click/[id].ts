// pages/api/affiliate/click/[id].ts
// Redirect endpoint for affiliate links - tracks clicks and redirects to verified URL
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { runCorsMiddleware } from '../../../../lib/cors-middleware';

const prisma = new PrismaClient();

// Simple in-memory rate limiter (per IP, 30 clicks per minute)
const clickRateLimit = new Map<string, { count: number; resetAt: number }>();
const MAX_CLICKS_PER_MINUTE = 30;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = clickRateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    clickRateLimit.set(ip, { count: 1, resetAt: now + 60000 });
    return false;
  }

  if (entry.count >= MAX_CLICKS_PER_MINUTE) {
    return true;
  }

  entry.count++;
  return false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runCorsMiddleware(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const reviewId = parseInt(req.query.id as string, 10);
  if (isNaN(reviewId)) {
    return res.status(400).json({ error: 'Invalid review ID' });
  }

  // Rate limit check
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    || req.socket.remoteAddress
    || 'unknown';

  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    // Only redirect if the affiliate review is approved
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        affiliateEnabled: true,
        affiliateStatus: { in: ['APPROVED', 'AUTO_APPROVED'] },
        affiliateLink: { not: null },
      },
      select: {
        id: true,
        affiliateLink: true,
        affiliateClickCount: true,
      },
    });

    if (!review || !review.affiliateLink) {
      return res.status(404).json({ error: 'Affiliate link not found or not approved' });
    }

    // Increment click count (fire-and-forget for speed)
    prisma.review.update({
      where: { id: reviewId },
      data: { affiliateClickCount: { increment: 1 } },
    }).catch((err) => {
      console.error('[AffiliateClick] Failed to increment click count:', err);
    });

    // 302 redirect to the affiliate URL
    res.setHeader('Location', review.affiliateLink);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return res.status(302).end();
  } catch (error) {
    console.error('Error processing affiliate click:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
