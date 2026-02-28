// Admin Auth controller for handling admin authentication logic
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_admin_jwt_secret';

/**
 * Register a new admin user
 * Requires a valid invite code to register
 */
export const registerAdmin = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { name, email, password, inviteCode } = req.body;
    
    // Validate inputs
    if (!name || !email || !password || !inviteCode) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Verify the invite code matches the environment variable
    const validInviteCode = process.env.ADMIN_INVITE_CODE;
    if (!validInviteCode || inviteCode !== validInviteCode) {
      return res.status(403).json({ message: 'Invalid invite code' });
    }
    
    // Check if admin with this email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Admin login
 */
export const loginAdmin = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { name, password } = req.body;

    // Validate inputs
    if (!name || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find admin by name
    const admin = await prisma.admin.findFirst({
      where: { name },
    });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get admin profile
 */
export const getAdminProfile = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // @ts-ignore - req.user would be set by the auth middleware
    const adminId = req.user?.id;
    
    if (!adminId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({ admin });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
