// File: src/services/userService.ts
import { API_BASE_URL } from '../config/api';
// Define the User interface
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
  imageUrl?: string;
  profileImage?: string;
  avatar?: string;
  photo?: string;
  image?: string;
}

// Fetch user profile
export const fetchUserProfile = async (): Promise<User> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No token found');

  const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to fetch profile: ${response.status} ${errorText}`);
  }
  return response.json();
};