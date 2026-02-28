// src/utils/api.ts
import { API_BASE_URL } from '../config/api';

export const loginUser = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

  
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };
  
  export const registerUser = async (userData: {
    name: string;
    email: string;
    password: string;
    contact: string;
    dob: string;
    gender: string;
    address: string;
    city: string;
    state: string;
    instagram: string;
    facebook: string;
    twitter: string;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
  
      if (!response.ok) {
        throw new Error('Registration failed');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };