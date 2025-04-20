import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Use bcryptjs instead of bcrypt
import Cors from 'cors';

const prisma = new PrismaClient();

const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
  origin: 'http://localhost:5173',
});

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);

  if (req.method === 'POST') {
    const { name, email, password, contact, dob, gender, address, city, state, instagram, facebook, twitter } = req.body;

    // Validation checks
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    try {
      // Check for existing user
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Proceed with user creation
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          contact: contact?.trim() || null,
          dob: dob ? new Date(dob) : null,
          gender: gender?.trim() || null,
          address: address?.trim() || null,
          city: city?.trim() || null,
          state: state?.trim() || null,
          instagram: instagram?.trim() || null,
          facebook: facebook?.trim() || null,
          twitter: twitter?.trim() || null
        }
      });
      
      res.status(201).json(user);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}