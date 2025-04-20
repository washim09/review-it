// This file contains the authentication service functions for login, logout, and user state management.
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Create a custom event for auth state changes
export const AUTH_STATE_CHANGED = 'authStateChanged';

export const emitAuthStateChange = () => {
  const event = new CustomEvent(AUTH_STATE_CHANGED, {
    detail: { authenticated: isAuthenticated() }
  });
  window.dispatchEvent(event);
};

export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  const user = getCurrentUser();
  if (!token || !user) return false;

  // Check if token is expired (if it's a JWT)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      // Token is expired
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return false;
    }
    return true;
  } catch {
    // If token can't be decoded, consider it invalid
    return false;
  }
};

export const login = async (email: string, password: string): Promise<User> => {
  console.log('Logging in with:', { email, password }); // Debugging
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Login failed:', error); // Debugging
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();
  console.log('Login response:', data); // Debugging

  // Ensure user is set correctly
  if (!data.user) {
    throw new Error('User data is missing in the login response');
  }

  localStorage.setItem('authToken', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  emitAuthStateChange();
  return data.user;
};

export const logout = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  emitAuthStateChange();
};