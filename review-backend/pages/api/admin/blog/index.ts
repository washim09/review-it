import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import jwt from 'jsonwebtoken';
import Cors from 'cors';

const JWT_SECRET = process.env.JWT_SECRET || 'a8f5f167f44f4964e6c998dee827110c8bd1a9c8b4e5f2a3b7d8c9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4';

const getImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const apiDomain = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'https://api.riviewit.com';
  return `${apiDomain}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Initialize CORS middleware
const cors = Cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  origin: [
    'https://riviewit.com',
    'https://www.riviewit.com',
    'https://admin.riviewit.com',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
  ],
  credentials: true,
});

// Helper to run middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Verify admin authentication
const verifyAdmin = (req: NextApiRequest): boolean => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return false;

  const token = authHeader.substring(7);
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run CORS middleware
  await runMiddleware(req, res, cors);

  // Handle OPTIONS requests for preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verify admin
  if (!verifyAdmin(req)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // GET - List all blog posts (including unpublished)
  if (req.method === 'GET') {
    try {
      const { category, search, limit = '20', offset = '0' } = req.query;
      const limitNum = parseInt(limit as string, 10);
      const offsetNum = parseInt(offset as string, 10);

      const where: any = {};

      if (category && category !== 'all') {
        where.category = category as string;
      }

      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { excerpt: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [posts, total] = await Promise.all([
        prisma.blogPost.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limitNum,
          skip: offsetNum,
        }),
        prisma.blogPost.count({ where }),
      ]);

      const normalizedPosts = posts.map((post: any) => ({
        ...post,
        coverImage: getImageUrl(post.coverImage),
        authorImage: getImageUrl(post.authorImage),
      }));

      return res.status(200).json({ posts: normalizedPosts, total });
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // POST - Create new blog post
  if (req.method === 'POST') {
    try {
      const {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        category,
        tags = [],
        author,
        authorImage,
        readTime = 5,
        isPublished = false,
      } = req.body;

      // Validate required fields
      if (!title || !slug || !excerpt || !content || !category || !author) {
        return res.status(400).json({
          message: 'Missing required fields: title, slug, excerpt, content, category, author',
        });
      }

      // Check if slug already exists
      const existingPost = await prisma.blogPost.findUnique({
        where: { slug },
      });

      if (existingPost) {
        return res.status(400).json({ message: 'Slug already exists' });
      }

      const post = await prisma.blogPost.create({
        data: {
          title,
          slug,
          excerpt,
          content,
          coverImage: coverImage || null,
          category,
          tags: Array.isArray(tags) ? tags : [],
          author,
          authorImage: authorImage || null,
          readTime,
          isPublished,
          publishedAt: isPublished ? new Date() : new Date(),
        },
      });

      return res.status(201).json({ message: 'Blog post created', post });
    } catch (error: any) {
      console.error('Error creating blog post:', error);
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
