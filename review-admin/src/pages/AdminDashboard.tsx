// src/pages/AdminDashboard.tsx
import { useEffect, useState } from 'react';
import { fetchUsers, fetchReviews } from '../services/adminService';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login'); 
    }

    const getData = async () => {
      const users = await fetchUsers();
      const reviews = await fetchReviews();

      setTotalUsers(users.length);
      setTotalReviews(reviews.length);

      const totalRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
      setAverageRating(totalRating / reviews.length || 0);
    };
    getData();
  }, [navigate]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="mt-4">
        <p>Total Users: {totalUsers}</p>
        <p>Total Reviews: {totalReviews}</p>
        <p>Average Rating: {averageRating.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;