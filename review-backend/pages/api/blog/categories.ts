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
    // Get distinct categories from published posts
    const posts = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    const categories = posts.map((post: any) => post.category);

    res.status(200).json({ categories });
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
