'use client'

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '../components/layout/Navbar';
import ReviewForm from '../components/reviews/ReviewForm';
import UserProfileReviews from '../components/profile/UserProfileReviews';
import UserDetails from '../components/profile/UserDetails';
import PushNotificationSettings from '../components/pwa/PushNotificationSettings';
import { fetchUserProfile } from '../services/userService';
import { FaPencilAlt } from 'react-icons/fa';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if we should auto-open the review form
  useEffect(() => {
    if (pathname === '/write-review') {
      setShowReviewForm(true);
    }
  }, [pathname]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profile = await fetchUserProfile();
      setUser(profile);
    } catch (err) {
      // Profile fetch failed
      
      // Always use cached user data from AuthContext as fallback
      if (currentUser) {
        // Using cached user data from AuthContext
        // Add missing createdAt field if not present
        const userWithDefaults = {
          ...currentUser,
          createdAt: currentUser.createdAt || new Date().toISOString()
        };
        setUser(userWithDefaults);
      } else {
        // No cached user data available
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Always fetch fresh profile data from the API
    // This ensures we get the latest data from the database, not stale cached data
    fetchProfile();
  }, []);

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-900 text-white">
        <Navbar />
        <div className="flex items-center justify-center flex-1">
          <div className="text-white">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-6 pt-20">
        {/* User Details Component */}
        {user && <UserDetails user={user} onUserUpdate={handleUserUpdate} />}
        
        {/* Push Notification Settings */}
        <div className="max-w-2xl mx-auto mt-6">
          <PushNotificationSettings />
        </div>
        
        {/* Write Review Button */}
        <div className="text-center mb-8 mt-6">
          <button
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition duration-200 shadow-lg flex items-center mx-auto"
            onClick={() => setShowReviewForm(true)}
          >
            <FaPencilAlt className="mr-2" />
            Write a Review
          </button>
        </div>

        {/* Display User Reviews */}
        <UserProfileReviews />
      </div>

      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm">
          <ReviewForm onClose={() => setShowReviewForm(false)} />
        </div>
      )}
    </div>
  );
};

export default UserProfile;