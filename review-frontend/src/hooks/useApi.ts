import axios, { AxiosRequestConfig } from 'axios';
import { useState, useCallback } from 'react';
import { getToken } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

interface ApiOptions extends AxiosRequestConfig {
  requireAuth?: boolean;
  timeoutMs?: number;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Custom hook for standardized API calls
export function useApi<T = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // API_BASE_URL imported from config/api

  const makeRequest = useCallback(async (
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    data?: unknown,
    options: ApiOptions = {}
  ) => {
    const {
      requireAuth = true,
      timeoutMs = 10000,
      ...axiosOptions
    } = options;

    setState(prev => ({ ...prev, loading: true, error: null }));

    // Create a controller to handle timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Prepare headers with authentication if required
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(axiosOptions.headers as Record<string, string> || {})
      };

      if (requireAuth) {
        const token = getToken();
        if (!token) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Authentication required'
          }));
          return { success: false, message: 'Authentication required' };
        }
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Build full URL
      const url = endpoint.startsWith('http') 
        ? endpoint 
        : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

      // Make the API call
      const response = await axios({
        url,
        method,
        data,
        headers,
        withCredentials: true,
        signal: controller.signal,
        ...axiosOptions
      });

      // Clear timeout when request completes
      clearTimeout(timeoutId);

      // Update state with successful response
      setState({
        data: response.data,
        loading: false,
        error: null
      });

      return { success: true, data: response.data };
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
      // Clear timeout on error
      clearTimeout(timeoutId);

      console.error(`API Error (${endpoint}):`, error);

      let errorMessage = 'An unexpected error occurred';

      if (axios.isCancel(error)) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.response) {
        // Server responded with an error status code
        switch (err.response.status) {
          case 401:
            errorMessage = 'Unauthorized: Please login again';
            break;
          case 403:
            errorMessage = 'You do not have permission to access this resource';
            break;
          case 404:
            errorMessage = 'Resource not found';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later';
            break;
          default:
            errorMessage = err.response.data?.message || `Error (${err.response.status})`;
        }
      } else if (err.message) {
        // Other errors (network, etc)
        errorMessage = err.message;
      } else {
        errorMessage = 'Network error';
      }

      setState({
        data: null,
        loading: false,
        error: errorMessage
      });

      return { success: false, message: errorMessage };
    }
  }, []);

  // Return state and request functions
  return {
    ...state,
    get: useCallback((endpoint: string, options?: ApiOptions) => 
      makeRequest(endpoint, 'GET', undefined, options), [makeRequest]),
    post: useCallback((endpoint: string, data?: unknown, options?: ApiOptions) => 
      makeRequest(endpoint, 'POST', data, options), [makeRequest]),
    put: useCallback((endpoint: string, data?: unknown, options?: ApiOptions) => 
      makeRequest(endpoint, 'PUT', data, options), [makeRequest]),
    patch: useCallback((endpoint: string, data?: unknown, options?: ApiOptions) => 
      makeRequest(endpoint, 'PATCH', data, options), [makeRequest]),
    del: useCallback((endpoint: string, options?: ApiOptions) => 
      makeRequest(endpoint, 'DELETE', undefined, options), [makeRequest]),
    reset: useCallback(() => setState({ data: null, loading: false, error: null }), [])
  };
}
