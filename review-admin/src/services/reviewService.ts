// services/reviewService.ts
import { API_BASE_URL } from '../config/api';

export const submitReview = async (formData: FormData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/reviews`, {
      method: 'POST',
      body: formData, // No need to set headers for FormData, the browser handles it
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to submit review');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};