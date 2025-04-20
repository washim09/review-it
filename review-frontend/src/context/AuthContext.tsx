// This file defines the AuthContext and provides authentication state management for the application.
// It includes functions for logging in, logging out, and checking authentication status. The context is used throughout the app to manage user authentication state.

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the User interface
import { User } from '../types/user';
import { readAuthData, clearAuthData, isAuthenticated as checkIsAuth } from '../utils/authHelpers';

// Define the AuthContextType
interface AuthContextType {
  currentUser: User | null;
  isAuth: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | null>(null);

// Helper function to get the current user from localStorage
// Use our new auth helpers
export const getCurrentUser = (): User | null => {
  const { user } = readAuthData();
  return user;
};

// Helper function to check if the user is authenticated
export const isAuthenticated = (): boolean => {
  return checkIsAuth();
};

// AuthProvider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const checkAuth = (): boolean => {
    const user = getCurrentUser();
    if (!user) {
      setIsAuth(false);
      setCurrentUser(null);
      return false;
    }
    setIsAuth(true);
    setCurrentUser(user);
    return true;
  };

  // Check auth only once at component mount
  useEffect(() => {
    // Initial auth check using our helper
    const { token, user } = readAuthData();
    console.log('Initial auth check:', { hasToken: !!token, hasUser: !!user });
    
    if (token && user) {
      setIsAuth(true);
      setCurrentUser(user);
    } else {
      setIsAuth(false);
      setCurrentUser(null);
    }
  }, []);

  // Login function to update state (storage already handled)
  const login = (token: string, user: User) => {
    console.log('Setting auth state in context:', { hasToken: !!token, user });
    setIsAuth(true);
    setCurrentUser(user);
  };

  // Logout function to clear state and stored data
  const logout = () => {
    clearAuthData(); // Use our helper to clear all auth data
    setIsAuth(false);
    setCurrentUser(null);
  };

  // Check auth state on mount and when localStorage changes
  useEffect(() => {
    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Debugging: Log auth state changes only once after it changes
  const prevAuthRef = React.useRef(isAuth);
  useEffect(() => {
    if (prevAuthRef.current !== isAuth) {
      console.log('Auth state changed:', { isAuth, currentUser });
      prevAuthRef.current = isAuth;
    }
  }, [isAuth, currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, isAuth, login, logout, checkAuth }}>
      {children}
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