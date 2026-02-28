//review-frontend/src/services/chatService.ts
import { API_BASE_URL } from '../config/api';

export interface ChatMessageData {
  reviewId: number;
  content: string;
}

export const sendChatMessage = async (messageData: ChatMessageData) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reviewId: Number(messageData.reviewId),
        content: messageData.content,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Network error:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to send message. Please check your connection.'
    );
  }
};