
import { API_BASE_URL } from '../config/api';

export interface Review {
  id: number;
  entity: string;
  rating: number;
  content: string;
  imageUrl: string | null;
  videoUrl: string | null;
  author: { name: string };
  tags: string[];
  createdAt: string;
}

// Function to submit a review
export const submitReview = async (formData: FormData) => {
  const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage
  if (!token) {
    throw new Error('No token found. Cannot submit review.');
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/reviews`, {
    method: 'POST',
    credentials: 'include', // Include credentials (cookies)
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to submit review');
  }

  return response.json();
};

// Function to fetch reviews for the logged-in user
export const fetchUserReviews = async (): Promise<Review[]> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No token found');

  const response = await fetch(`${API_BASE_URL}/api/admin/reviews`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // Send token in the header
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch reviews');
  }

  return response.json();
};


// src/services/reviewService.ts
export const fetchLatestReviews = async (): Promise<Review[]> => {
  const response = await fetch(`${API_BASE_URL}/api/reviews/latest`);
  if (!response.ok) {
    throw new Error('Failed to fetch latest reviews');
  }
  return response.json();
};