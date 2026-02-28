// Auth controller for handling authentication logic
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateVerificationToken } from './emailVerificationController';
import EmailService from '../lib/emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const register = async (req: NextApiRequest, res: NextApiResponse) => {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      name, 
      email, 
      password, 
      imageUrl, 
      contact, 
      dob, 
      gender, 
      address, 
      city, 
      state, 
      instagram, 
      facebook, 
      twitter 
    } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user first with all fields
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        imageUrl,
        contact,
        dob: dob ? new Date(dob) : null,
        gender,
        address,
        city,
        state,
        instagram,
        facebook,
        twitter,
        isVerified: false,
      },
    });

    // Generate email verification token after user creation
    const verificationToken = generateVerificationToken(user.id.toString(), email);
    
    // Update user with verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send verification email
    try {
      console.log('📨 Preparing to send verification email...');
      console.log('User details:', { email, name });
      console.log('Environment check:');
      console.log('- SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'Set' : 'Not set');
      console.log('- SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL || 'Not set');
      console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');
      
      const emailSent = await EmailService.sendVerificationEmail(email, name, verificationToken);
      
      if (emailSent) {
        console.log('✅ Verification email queued for:', email);
      } else {
        console.error('❌ Verification email failed for:', email);
      }
    } catch (emailError) {
      console.error('❌ Exception while sending verification email:', emailError);
      // Don't fail registration if email fails, but log the error
    }

    // Create token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully! Please check your email to verify your account.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.isVerified,
      },
      requiresEmailVerification: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { email, password } = req.body;

    // Find user with all profile fields
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        imageUrl: true,
        profileImage: true,
        contact: true,
        dob: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        instagram: true,
        facebook: true,
        twitter: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user has a password (OAuth users might not have passwords)
    if (!user.password) {
      return res.status(400).json({ message: 'Invalid credentials. Please use social login.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
        profileImage: user.profileImage,
        contact: user.contact,
        dob: user.dob,
        gender: user.gender,
        address: user.address,
        city: user.city,
        state: user.state,
        instagram: user.instagram,
        facebook: user.facebook,
        twitter: user.twitter,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const userId = req.body.userId; // From auth middleware
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        contact: true,
        dob: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        instagram: true,
        facebook: true,
        twitter: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
