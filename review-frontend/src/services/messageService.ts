// This file contains the message service that fetches user messages from the API.
// It handles authentication and error management.
//review-frontend/src/services/messageService.ts
// export interface Message {
//   id: number;
//   content: string;
//   createdAt: string;
//   updatedAt: string;
//   isReply: boolean;
//   isRead: boolean;
//   senderId: number;
//   recipientId: number;
//   reviewId: number;
//   sender: {
//     id: number;
//     name: string;
//     email: string;
//   };
//   recipient: {
//     id: number;
//     name: string;
//     email: string;
//   };
//   review: {
//     id: number;
//     title: string;
//     entity: string;
//     imageUrl: string | null;
//   };
// }


// export const fetchUserMessages = async (): Promise<Message[]> => {
//   const token = localStorage.getItem('authToken');
//   if (!token) {
//     throw new Error('Authentication required');
//   }

//   try {
//     const response = await fetch('http://localhost:3000/api/messages', {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//         'Accept': 'application/json'
//       },
//     });

//     if (!response.ok) {
//       if (response.status === 401) {
//         localStorage.removeItem('authToken');
//         throw new Error('Authentication expired');
//       }
//       throw new Error('Failed to fetch messages');
//     }

//     const contentType = response.headers.get('content-type');
//     if (!contentType || !contentType.includes('application/json')) {
//       throw new Error('Invalid response format');
//     }

//     return response.json();
//   } catch (error) {
//     console.error('Messages fetch error:', error);
//     throw error;
//   }
// };










// messageService.ts
export interface Message {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  isReply: boolean;
  isRead: boolean;
  senderId: number;
  recipientId: number;
  reviewId: number;
  sender: {
    id: number;
    name: string;
    email: string;
  };
  recipient: {
    id: number;
    name: string;
    email: string;
  };
  review: {
    id: number;
    title: string;
    entity: string;
    imageUrl: string | null;
  };
}
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const handleResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            throw new Error('Authentication expired');
        }
        try {
          const errorData = contentType?.includes('application/json') ? await response.json() : await response.text();
          throw new Error(`Failed to fetch messages: ${response.statusText} - ${JSON.stringify(errorData)}`);
        } catch (parseError) {
          throw new Error(`Failed to parse error response: ${parseError} - Original status: ${response.status} - Original status text: ${response.statusText}`);
        }
    }

    if (contentType && contentType.includes('application/json')) {
        return response.json();
    } else {
        throw new Error('Invalid response format: expected JSON');
    }
};

export const fetchUserMessages = async (): Promise<Message[]> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(`${API_URL}/messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });
    return handleResponse(response);

  } catch (error) {
    console.error('Messages fetch error:', error);
    throw error;
  }
};

export const getUnreadMessageCount = async (): Promise<number> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }
    try {
      const response = await fetch(`${API_URL}/messages?type=unread-count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Failed to fetch unread message count:', error);
      throw error;
    }
  };

  export const markMessagesAsRead = async (messageIds: number[]): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }
    try {
      const response = await fetch(`${API_URL}/messages?type=mark-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageIds }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      throw error;
    }
  };

// Legacy function - keeping for compatibility
export const sendChatMessage = async (messageData: any): Promise<void> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(`${API_URL}/chat`, { //TODO : Update to your chat api url
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });
    return handleResponse(response);

  } catch (error) {
    console.error('Failed to send chat message:', error);
    throw error;
  }
};

// New HTTP API message sending function
export const sendMessage = async (messageData: {
  content: string;
  recipientId: number;
  reviewId: number | null;
}): Promise<Message> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    // First try the chat API endpoint
    const chatEndpoint = `${API_URL}/chat`;
    console.log(`Sending message to ${chatEndpoint}`, messageData);

    const response = await fetch(chatEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });

    // If chat endpoint returns 404, try the messages endpoint
    if (response.status === 404) {
      console.log('Chat endpoint not found, trying messages endpoint');
      const messagesEndpoint = `${API_URL}/messages`;

      const fallbackResponse = await fetch(messagesEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      return handleResponse(fallbackResponse);
    }

    return handleResponse(response);
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
};