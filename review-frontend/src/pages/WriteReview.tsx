'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import ReviewForm from '../components/reviews/ReviewForm';

const WriteReview: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleFormClose = () => {
    setShowForm(false);
    router.push('/profile');
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    router.push('/profile');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-950 pt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">Write a Review</h1>
              <p className="text-gray-300">Share your experience and help others make informed decisions</p>
            </div>
            
            {showForm && (
              <ReviewForm 
                onClose={handleFormClose}
                onSubmit={handleFormSubmit}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WriteReview;
