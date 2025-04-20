// This file contains the chat service functions for sending messages to the server.
// It handles authentication and error management.
// review-frontend/src/services/chatService.ts
export interface SendChatMessageParams {
  reviewId?: number;
  content: string;
  isReply?: boolean;
  originalSenderId?: number;
}

export const sendChatMessage = async (params: SendChatMessageParams) => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Authentication required');

  const response = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
 };

// Get unread message count
export const getUnreadMessageCount = async () => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Authentication required');

  try {
    // Use the correct endpoint with query parameter
    const response = await fetch('http://localhost:3000/api/messages?type=unread-count', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch unread count:', response.status, response.statusText);
      return { count: 0 };
    }

    const count = await response.json();
    return { count };
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return { count: 0 }; // Return a default value on error
  }
};

// Mark messages as read
export const markMessagesAsRead = async (messageIds: number[]) => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Authentication required');

  try {
    // Use the correct endpoint with query parameter
    const response = await fetch('http://localhost:3000/api/messages?type=mark-read', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ messageIds })
    });

    if (!response.ok) {
      console.error('Failed to mark messages as read:', response.status, response.statusText);
      throw new Error('Failed to mark messages as read');
    }

    return response.json();
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};