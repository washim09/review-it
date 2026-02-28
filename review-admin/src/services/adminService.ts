import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/api/admin`;

const getToken = () => {
  const token = localStorage.getItem('adminToken');
  return token; // Return null if token is missing
};

export const fetchUsers = async () => {
  const token = getToken();
  if (!token) {
    console.error('No token found. Cannot fetch users.');
    return [];
  }

  try {
    const response = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const fetchUser = async (userId: number) => {
  const token = getToken();
  if (!token) {
    console.error('No token found. Cannot fetch user details.');
    return {};
  }

  try {
    const response = await axios.get(`${API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return {};
  }
};

export const updateUser = async (userId: number, userData: any) => {
  const token = getToken();
  const response = await axios.put(`${API_URL}/users/${userId}`, userData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteUser = async (userId: number) => {
  const token = getToken();
  const response = await axios.delete(`${API_URL}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Fetch reviews for the admin panel with improved CORS handling
export const fetchReviews = async () => {
  const token = getToken();
  if (!token) {
    console.error('No admin token found. Cannot fetch reviews.');
    return [];
  }

  try {
    // Configure axios with improved CORS and error handling
    const response = await axios.get(`${API_URL}/reviews`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // Disable credentials for CORS simplicity
      withCredentials: false,
      // Increase timeout to handle potential delays
      timeout: 10000
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
    
    return [];
  }
};

// Delete a review
export const deleteReview = async (reviewId: number) => {
  const token = getToken();
  if (!token) {
    console.error('No admin token found. Cannot delete review.');
    return; // Return early if token is missing
  }

  try {
    await axios.delete(`${API_URL}/reviews/${reviewId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Error deleting review:', error);
  }
};

// File: src/services/adminService.ts
// import axios from 'axios';

// const API_URL = 'https://api.riviewit.com/api/admin';

// export const fetchUsers = async () => {
//   const response = await axios.get(`${API_URL}/users`);
//   return response.data;
// };

// export const fetchUser = async (userId: number) => {
//   const response = await axios.get(`${API_URL}/users/${userId}`);
//   return response.data;
// };

// export const updateUser = async (userId: number, userData: any) => {
//   const response = await axios.put(`${API_URL}/users/${userId}`, userData);
//   return response.data;
// };

// export const deleteUser = async (userId: number) => {
//   const response = await axios.delete(`${API_URL}/users/${userId}`);
//   return response.data;
// };

// export const fetchReviews = async () => {
//   const response = await axios.get(`${API_URL}/reviews`);
//   return response.data;
// };

// export const deleteReview = async (reviewId: number) => {
//   const response = await axios.delete(`${API_URL}/reviews/${reviewId}`);
//   return response.data;
// };

