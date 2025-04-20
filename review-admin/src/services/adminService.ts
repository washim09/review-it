import axios from 'axios';

const API_URL = 'http://localhost:3000/api/admin';

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
  const response = await axios.get(`${API_URL}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
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


// Fetch reviews for the admin panel
export const fetchReviews = async () => {
  const token = getToken();
  if (!token) {
    console.error('No admin token found. Cannot fetch reviews.');
    return [];
  }

  try {
    const response = await axios.get(`${API_URL}/reviews`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
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

// const API_URL = 'http://localhost:3000/api/admin';

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




