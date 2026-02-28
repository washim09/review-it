import axios from 'axios';
import { getToken } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

// Function to save token to localStorage (since we don't have setToken)
const saveToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

// Function to check if token is expired
export const isTokenExpired = (token: string): boolean => {
  if (!token) return true;

  try {
    // Get the expiration time from the token
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));
    const exp = payload.exp * 1000; // Convert to milliseconds
    
    return Date.now() > exp;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If there's an error parsing, assume token is invalid
  }
};

// Refresh token function - this assumes your backend has a refresh endpoint
export const refreshToken = async (): Promise<string> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    
    if (response.data.token) {
      saveToken(response.data.token);
      return response.data.token;
    }
    throw new Error('No token received');
  } catch (error) {
    console.error('Failed to refresh token:', error);
    // Clear the token and redirect to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw error;
  }
};

// Axios interceptor to handle token expiration
export const setupAuthInterceptor = () => {
  axios.interceptors.request.use(
    async (config) => {
      let token = getToken();
      
      // If token exists but is expired, try to refresh
      if (token && isTokenExpired(token)) {
        try {
          token = await refreshToken();
        } catch (error) {
          // If refresh fails, proceed with request (will likely fail)
          console.error('Token refresh failed:', error);
        }
      }
      
      // Add token to request
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to catch 401 errors
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If error is 401 and we haven't already tried to refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Try to refresh the token
          const token = await refreshToken();
          
          // Update the request header
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          
          // Retry the request
          return axios(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
};
