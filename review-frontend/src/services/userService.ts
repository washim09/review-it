// File: src/services/userService.ts
// Description: This file contains the functions for fetching user profile information, statistics, and reviews.

export interface User {
  id: string;
  name: string;
  email: string;
  contact: string;
  address: string;
  city: string;
  state: string;
  instagram: string;
  facebook: string;
  twitter: string;
}

export const fetchUserProfile = async (token: string) => {
  const apiUrl = `${import.meta.env.VITE_API_URL}/user`;
  const controller = new AbortController();
  const timeoutDuration = 10000; // 10 seconds

  try {
    // Set timeout
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId); // Clear timeout if request completes

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage;
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || `HTTP error ${response.status}`;
      } else {
        const text = await response.text();
        errorMessage = text || `HTTP error ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Request timed out:', apiUrl);
      throw new Error('Request took too long. Please try again.');
    }
    console.error('API Request Failed:', {
      url: apiUrl,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};


export const fetchUserStats = async (userId: string, token: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/user/stats/${userId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to fetch stats');
  }
  
  return await response.json();
};