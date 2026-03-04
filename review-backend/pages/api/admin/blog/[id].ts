import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
  // Verify admin
  if (!verifyAdmin(req)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;
  const postId = parseInt(id as string, 10);

  if (isNaN(postId)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }

  // GET - Get single post
  if (req.method === 'GET') {
    try {
      const post = await prisma.blogPost.findUnique({
        where: { id: postId },
      });

      if (!post) {
        return res.status(404).json({ message: 'Blog post not found' });
      }

      return res.status(200).json(post);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // PUT - Update blog post
  if (req.method === 'PUT') {
    try {
      const {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        category,
        tags,
        author,
        authorImage,
        readTime,
        isPublished,
      } = req.body;

      // Check if post exists
      const existingPost = await prisma.blogPost.findUnique({
        where: { id: postId },
      });

      if (!existingPost) {
        return res.status(404).json({ message: 'Blog post not found' });
      }

      // If slug is being changed, check it doesn't conflict
      if (slug && slug !== existingPost.slug) {
        const slugConflict = await prisma.blogPost.findUnique({
          where: { slug },
        });

        if (slugConflict) {
          return res.status(400).json({ message: 'Slug already exists' });
        }
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (slug !== undefined) updateData.slug = slug;
      if (excerpt !== undefined) updateData.excerpt = excerpt;
      if (content !== undefined) updateData.content = content;
      if (coverImage !== undefined) updateData.coverImage = coverImage;
      if (category !== undefined) updateData.category = category;
      if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
      if (author !== undefined) updateData.author = author;
      if (authorImage !== undefined) updateData.authorImage = authorImage;
      if (readTime !== undefined) updateData.readTime = readTime;
      if (isPublished !== undefined) {
        updateData.isPublished = isPublished;
        // Update publishedAt if publishing for first time
        if (isPublished && !existingPost.isPublished) {
          updateData.publishedAt = new Date();
        }
      }

      const post = await prisma.blogPost.update({
        where: { id: postId },
        data: updateData,
      });

      return res.status(200).json({ message: 'Blog post updated', post });
    } catch (error: any) {
      console.error('Error updating blog post:', error);
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  // DELETE - Delete blog post
  if (req.method === 'DELETE') {
    try {
      const post = await prisma.blogPost.findUnique({
        where: { id: postId },
      });

      if (!post) {
        return res.status(404).json({ message: 'Blog post not found' });
      }

      await prisma.blogPost.delete({
        where: { id: postId },
      });

      return res.status(200).json({ message: 'Blog post deleted successfully' });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
