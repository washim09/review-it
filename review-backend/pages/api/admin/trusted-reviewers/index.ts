// pages/api/admin/trusted-reviewers/index.ts
// GET: List trusted reviewers | POST: Add/update trusted reviewer status
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
  } catch { return null; }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runCorsMiddleware(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const adminId = getAdminId(req);
  if (!adminId) return res.status(401).json({ error: 'Admin access required' });

  // GET - List all trusted reviewer entries with user info
  if (req.method === 'GET') {
    try {
      const entries = await prisma.trustedReviewer.findMany({
        orderBy: { createdAt: 'desc' },
      });

      // Get user info for each entry
      const userIds = entries.map(e => e.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true, imageUrl: true },
      });
      const userMap = Object.fromEntries(users.map(u => [u.id, u]));

      const result = entries.map(e => ({
        ...e,
        user: userMap[e.userId] || { id: e.userId, name: 'Unknown', email: '' },
      }));

      return res.status(200).json({ trustedReviewers: result });
    } catch (error) {
      console.error('[TrustedReviewers] GET error:', error);
      return res.status(500).json({ error: 'Failed to fetch trusted reviewers' });
    }
  }

  // POST - Add or toggle trusted reviewer status
  if (req.method === 'POST') {
    try {
      const { userId, isTrusted } = req.body;
      if (!userId) return res.status(400).json({ error: 'userId is required' });

      const existing = await prisma.trustedReviewer.findUnique({
        where: { userId: parseInt(userId, 10) },
      });

      if (existing) {
        const updated = await prisma.trustedReviewer.update({
          where: { userId: parseInt(userId, 10) },
          data: {
            isTrusted: isTrusted !== undefined ? isTrusted : !existing.isTrusted,
            trustedSince: isTrusted ? new Date() : existing.trustedSince,
            lastAuditAt: new Date(),
          },
        });
        return res.status(200).json({ success: true, trustedReviewer: updated });
      } else {
        const created = await prisma.trustedReviewer.create({
          data: {
            userId: parseInt(userId, 10),
            isTrusted: isTrusted !== undefined ? isTrusted : true,
            trustedSince: new Date(),
            lastAuditAt: new Date(),
          },
        });
        return res.status(201).json({ success: true, trustedReviewer: created });
      }
    } catch (error) {
      console.error('[TrustedReviewers] POST error:', error);
      return res.status(500).json({ error: 'Failed to update trusted reviewer' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
