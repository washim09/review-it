
import { API_BASE_URL } from '../config/api';

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
  return !!token && !!user;
};

export const login = async (email: string, password: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Login failed:', error);
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  emitAuthStateChange();
};

export const logout = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  emitAuthStateChange();
};