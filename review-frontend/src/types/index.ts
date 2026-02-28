// Type definitions for the review-it frontend

export interface User {
  id: number;
  name: string;
  email: string;
  contact?: string;
  dob?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  createdAt: string;
  // Profile image fields (all optional to support different API responses)
  imageUrl?: string;
  profileImage?: string;
  avatar?: string;
  photo?: string;
  image?: string;
}

export interface Review {
  id: number;
  entity: string;
  category?: string;
  rating: number;
  review: string;
  imageUrl?: string;
  videoUrl?: string;
  media?: Array<string | { 
    url?: string;
    path?: string;
    type?: string;
    thumbnailUrl?: string;
    thumbnail?: string;
  }>;
  mediaUrls?: string[];
  mediaTypes?: string[];
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  authorId: number;
  author?: User;
}

export interface ChatMessage {
  id: number;
  content: string;
  reviewId: number;
  review?: Review;
  senderId: number;
  sender?: User;
  recipientId: number;
  recipient?: User;
  isRead: boolean;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
}
