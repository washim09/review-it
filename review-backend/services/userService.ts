// services/userService.ts
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
  contact: string;
  dob: Date;
  gender: string;
  address: string;
}) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    throw new Error('Email is already in use.');
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const newUser = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      contact: userData.contact,
      dob: userData.dob,
      gender: userData.gender,
      address: userData.address,
    },
  });

  return newUser;
};