import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type ImpactMetrics = {
  activeUsers: number;
  reviewsWritten: number;
  productCategories: number;
  generatedAt: string;
};

type ApiResponse =
  | { success: true; data: ImpactMetrics }
  | { success: false; error: string };

const CACHE_TTL_MS = 60_000;

let cache: { expiresAt: number; data: ImpactMetrics } | null = null;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // CORS (public endpoint)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  // Cache headers (near real-time but efficient)
  res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');

  try {
    const now = Date.now();
    if (cache && cache.expiresAt > now) {
      return res.status(200).json({ success: true, data: cache.data });
    }

    const [activeUsers, reviewsWritten, categoriesDistinct] = await Promise.all([
      prisma.user.count(),
      prisma.review.count(),
      prisma.review.findMany({
        where: { category: { not: null } },
        distinct: ['category'],
        select: { category: true },
      }),
    ]);

    const productCategories = categoriesDistinct.filter((x) => (x.category ?? '').trim().length > 0).length;

    const data: ImpactMetrics = {
      activeUsers,
      reviewsWritten,
      productCategories,
      generatedAt: new Date().toISOString(),
    };

    cache = { expiresAt: now + CACHE_TTL_MS, data };

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Impact metrics error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch impact metrics' });
  }
}