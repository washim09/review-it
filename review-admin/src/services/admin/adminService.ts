import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth/admin-login';

// Helper function to get the admin token from localStorage
const getAdminToken = () => {
  const token = localStorage.getItem('adminToken');
  return token; // Return null if token is missing
};

// Verify if the user is an admin
export const verifyAdmin = async () => {
  const token = getAdminToken();
  if (!token) return false;

  try {
    const response = await axios.get(`${API_URL}/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.role === 'admin';
  } catch (error) {
    console.error('Error verifying admin:', error);
    return false;
  }
};

// Fetch admin-specific data
export const fetchAdminData = async () => {
  const token = getAdminToken();
  if (!token) {
    console.error('No admin token found.');
    return [];
  }

  try {
    const response = await axios.get(`${API_URL}/data`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return [];
  }
};