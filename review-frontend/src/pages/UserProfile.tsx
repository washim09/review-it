// File: src/pages/UserProfile.tsx
// Description: This file contains the UserProfile component which fetches and displays user profile information, statistics, and reviews.
// It also includes a review form for submitting new reviews.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { readAuthData } from '../utils/authHelpers';
import ProfileNavbar from '../components/ProfileNavbar';
import ReviewForm from '../components/ReviewForm';
import UserProfileReviews from '../components/UserProfileReviews';
import { FaPencilAlt, FaChartLine } from 'react-icons/fa';

import { User, UserStats } from '../types/user';

// Fetch unread messages count
const fetchUnreadCount = async (token: string): Promise<{ count: number }> => {
  try {
    const response = await fetch('http://localhost:3000/api/messages?type=unread-count', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }

    const count = await response.json();
    console.log('Unread count:', count);
    return { count };
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return { count: 0 };
  }
};

// Fetch user stats
const fetchUserStats = async (userId: string, token: string): Promise<UserStats> => {
  try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user stats');
    }

    const data = await response.json();
    return {
      totalReviews: data.totalReviews || 0,
      avgRating: data.avgRating || 0,
      totalComments: data.totalComments || 0,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      totalReviews: 0,
      avgRating: 0,
      totalComments: 0,
    };
  }
};

// Fetch user profile
const fetchUserProfile = async (token: string): Promise<User> => {
  try {
    const response = await fetch('http://localhost:3000/api/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Profile fetch error:', error);
    throw error;
  }
};


const UserProfile = () => {
  const navigate = useNavigate();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [user, setUser] = useState<User>({ 
    id: 0, 
    name: '', 
    email: ''
  });
  const [stats, setStats] = useState<UserStats>({
    totalReviews: 0,
    avgRating: 0,
    totalComments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const { currentUser } = useAuth();
const token = localStorage.getItem('authToken');

  useEffect(() => {
    // Get authentication data directly
    const { token: storedToken, user: storedUser } = readAuthData();
    
    console.log('UserProfile - Direct Auth Check:', {
      storedToken: !!storedToken,
      storedUser: !!storedUser,
      contextToken: !!token,
      contextUser: !!currentUser
    });

    const loadData = async () => {
      try {
        // Use either stored data or context data with type safety
        const authToken = storedToken || token || '';
        const authUser = storedUser || (currentUser ? currentUser : null);
        
        if (!authToken || !authUser) {
          console.log('No authentication data found');
          return;
        }

        setLoading(true);
        setError(null);

        // Set initial user data
        if (currentUser) {
          const userData: User = {
            id: Number(currentUser.id) || 0,
            name: String(currentUser.name) || '',
            email: String(currentUser.email) || ''
          };
          setUser(userData);
        }

        // Type guards to ensure we have a valid token and user
        if (!authToken || !authUser) {
          throw new Error('No valid auth data found');
        }
        
        // Fetch fresh data in the background
        const [userProfile, stats, unread] = await Promise.all([
          fetchUserProfile(authToken),
          fetchUserStats(String(authUser.id), authToken),
          fetchUnreadCount(authToken),
        ]);

        // Update state with fresh data
        const updatedUser: User = {
          id: Number(userProfile.id) || 0,
          name: String(userProfile.name) || '',
          email: String(userProfile.email) || '',
        };
        setUser(updatedUser);
        setStats(stats);
        setUnreadCount(Number(unread?.count || 0));
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !user.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">You are not logged in.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileNavbar unreadCount={unreadCount} />

      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome back, {user.name}!
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Share your experiences and help others make informed decisions
            </p>
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              <FaPencilAlt className="mr-2" />
              Write a Review
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:-translate-y-1 transition-transform">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaChartLine className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReviews.toString()}</p>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalComments.toString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Your Reviews</h2>
          <UserProfileReviews userId={user.id} />
        </div>
      </div>

      {showReviewForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
            <ReviewForm userId={user.id} onClose={() => setShowReviewForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;