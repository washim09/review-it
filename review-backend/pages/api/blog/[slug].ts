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

const getImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const apiDomain = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'https://api.riviewit.com';
  return `${apiDomain}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ message: 'Invalid slug parameter' });
    }

    const post = await prisma.blogPost.findUnique({
      where: {
        slug,
        isPublished: true,
      },
    });

    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Increment view count
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    const formattedPost = {
      ...post,
      coverImage: getImageUrl(post.coverImage),
      authorImage: getImageUrl(post.authorImage),
      publishedAt: post.publishedAt.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };

    res.status(200).json(formattedPost);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
