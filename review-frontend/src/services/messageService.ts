
import { API_BASE_URL } from '../config/api';

export interface Message {
  id: number;
  content: string;
  createdAt: string;
  isRead: boolean;
  review: {
    id: number;
    entity: string;
    imageUrl: string;
  };
  sender: {
    name: string;
  };
}

export const fetchUserMessages = async (): Promise<Message[]> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/api/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }

  return response.json();
};