'use client'

//AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { API_BASE_URL } from '../config/api';

// User interface is now imported from types/index.ts

// Define the AuthContextType
interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  isAuth: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | null>(null);

// Helper function to get the current user from localStorage
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined') {
      return null; // Return null if userStr is undefined or invalid
    }
    return JSON.parse(userStr); // Parse the user object
  } catch (error) {
    // Failed to parse user from localStorage
    return null;
  }
};

// Helper function to check if the user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  const user = getCurrentUser();
  return !!token && !!user; // This is just initial check, real validation happens with the backend
};

// Helper function to get token
export const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// AuthProvider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuth, setIsAuth] = useState<boolean>(false); // Start with false until validated
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  // Login function to update state and localStorage
  const login = (token: string, user: User) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user)); // Store user in localStorage
    setIsAuth(true);
    setCurrentUser(user);
  };

  // Logout function to clear state and localStorage
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuth(false);
    setCurrentUser(null);
  };

  // Validate token with the backend
  const validateToken = async () => {
    const token = localStorage.getItem('authToken');
    const user = getCurrentUser();
    
    if (!token || !user) {
      // No token or user, definitely not authenticated
      setIsAuth(false);
      setCurrentUser(null);
      setIsLoading(false);
      setAuthChecked(true);
      return;
    }
    
    // Check if token is expired by decoding it (without verification)
    let tokenExpired = false;
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      tokenExpired = tokenPayload.exp < currentTime;
    } catch (error) {
      tokenExpired = true; // Assume expired if we can't decode
    }
    
    // If token is not expired and we have user data, use cached data
    if (!tokenExpired && user) {
      setIsAuth(true);
      setCurrentUser(user);
      setIsLoading(false);
      setAuthChecked(true);
      return;
    }

    // Try to refresh the token if it's expired or if we don't have user data
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update token and user data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsAuth(true);
        setCurrentUser(data.user);
      } else {
        
        // If refresh fails, clear auth state completely
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setIsAuth(false);
        setCurrentUser(null);
      }
    } catch (error) {
      // If network error and token is expired, clear auth state
      if (tokenExpired) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setIsAuth(false);
        setCurrentUser(null);
      } else if (user) {
        // If network error but token might still be valid, use cached data temporarily
        setIsAuth(true);
        setCurrentUser(user);
      } else {
        // No cached data and network error, clear auth state
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setIsAuth(false);
        setCurrentUser(null);
      }
    }
    
    setIsLoading(false);
    setAuthChecked(true);
    
    /* Old validation code - keeping for reference
    try {
      // Call the backend to validate the token
      const response = await axios.get(`${API_BASE_URL}/api/auth/validate-token`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.valid) {
        // Token is valid (might be expired but still usable with userId)
        setIsAuth(true);
        setCurrentUser(user);
        
        // If the token is expired but valid, refresh it silently
        if (response.data.isExpired || response.data.needsRefresh) {
          try {

            // Call refresh endpoint to get a new token
            const refreshResponse = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            if (refreshResponse.data.token) {
              // Update token in localStorage
              localStorage.setItem('authToken', refreshResponse.data.token);

            }
          } catch (refreshError) {
            // Failed to refresh token - continue with expired token
            // Continue with the expired token, interceptors will handle it later
          }
        }
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setIsAuth(false);
        setCurrentUser(null);
      }
    } catch (error) {
      // Error validating token, assume it's invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setIsAuth(false);
      setCurrentUser(null);
    }
    
    setIsLoading(false);
    setAuthChecked(true);
    */
  };

  // Check for authentication on mount and after any relevant storage change
  useEffect(() => {
    // Check auth on mount
    validateToken();

    // Listen for storage events (if user logs in in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' || e.key === 'user') {
        validateToken();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Only log auth state changes in development
  useEffect(() => {
    // Auth state checked - no need to log in production
  }, [isAuth, currentUser, authChecked]);

  // Only render children after initial auth check
  return (
    <AuthContext.Provider value={{ user: currentUser, currentUser, isAuth, isAuthenticated: isAuth, isLoading, login, logout }}>
      {authChecked ? children : <div className="flex items-center justify-center min-h-screen">Checking authentication...</div>}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};