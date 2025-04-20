// Temporary test route
// pages/api/test-db.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json({ count: users.length });
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
}