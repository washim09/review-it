// Authentication helper utilities
import { User } from '../types/user';

// Store auth data both in localStorage and cookies for redundancy
export const storeAuthData = (token: string, user: User): boolean => {
  try {
    // Try localStorage
    window.localStorage.setItem('authToken', token);
    window.localStorage.setItem('userData', JSON.stringify(user));
    
    // Also set cookies with SameSite attribute
    document.cookie = `authToken=${encodeURIComponent(token)};path=/;max-age=3600;SameSite=Lax`;
    document.cookie = `userData=${encodeURIComponent(JSON.stringify(user))};path=/;max-age=3600;SameSite=Lax`;
    
    console.log('Auth data stored successfully:', {
      localStorage: Boolean(localStorage.getItem('authToken')),
      cookies: document.cookie.includes('authToken')
    });
    
    return true;
  } catch (error) {
    console.error('Error storing auth data:', error);
    return false;
  }
};

// Get a cookie by name
export const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
};

// Read auth data from any available source
export const readAuthData = (): { token: string | null, user: User | null } => {
  let token: string | null = null;
  let userStr: string | null = null;
  let user: User | null = null;
  
  // Try localStorage first
  try {
    token = localStorage.getItem('authToken');
    userStr = localStorage.getItem('userData');
  } catch (e) {
    console.log('Could not read from localStorage');
  }
  
  // If localStorage fails, try cookies
  if (!token || !userStr) {
    try {
      token = getCookie('authToken');
      userStr = getCookie('userData');
      console.log('Reading from cookies:', { token: !!token, userStr: !!userStr });
    } catch (e) {
      console.log('Could not read from cookies');
    }
  }
  
  // Parse user data if we have it
  if (userStr) {
    try {
      const userData = JSON.parse(userStr);
      console.log('User data parsed:', userData);
      
      if (userData && userData.id && userData.name && userData.email) {
        user = {
          id: Number(userData.id),
          name: String(userData.name),
          email: String(userData.email)
        };
      }
    } catch (e) {
      console.error('Failed to parse user data:', e);
    }
  }
  
  return { token, user };
};

// Clear all auth data
export const clearAuthData = (): void => {
  // Clear localStorage
  try {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  } catch (e) {
    console.error('Failed to clear localStorage:', e);
  }
  
  // Clear cookies
  try {
    document.cookie = 'authToken=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'userData=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  } catch (e) {
    console.error('Failed to clear cookies:', e);
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const { token, user } = readAuthData();
  return !!token && !!user;
};
