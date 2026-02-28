// Type definitions for the review-it backend

import { User, Review, ChatMessage } from '@prisma/client';

export type { User, Review, ChatMessage };

// Extended types with relations
export interface ReviewWithAuthor extends Review {
  author: User;
}

export interface ChatMessageWithRelations extends ChatMessage {
  sender: User;
  recipient: User;
  review: Review;
}

// API request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

// JWT payload
export interface JwtPayload {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
}

// Request with authenticated user
export interface AuthenticatedRequest {
  userId: number;
  userEmail: string;
}
