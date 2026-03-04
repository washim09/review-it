import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import Cors from 'cors';
import initMiddleware from '../../../middleware/initMiddleware';

const cors = initMiddleware(
  Cors({
    methods: ['GET', 'HEAD'],
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  })
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { category, limit = '10', offset = '0' } = req.query;
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);

    const where: any = {
      isPublished: true,
    };

    if (category && category !== 'all') {
      where.category = category as string;
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: {
          publishedAt: 'desc',
        },
        take: limitNum,
        skip: offsetNum,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          category: true,
          tags: true,
          author: true,
          authorImage: true,
          readTime: true,
          viewCount: true,
          publishedAt: true,
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    const formattedPosts = posts.map((post: any) => ({
      ...post,
      publishedAt: post.publishedAt.toISOString(),
    }));

    res.status(200).json({
      posts: formattedPosts,
      total,
      hasMore: offsetNum + limitNum < total,
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
