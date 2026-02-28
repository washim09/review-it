'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ReviewContextType {
  reviewsUpdated: boolean;
  setReviewsUpdated: (updated: boolean) => void;
  refreshReviews: () => void;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reviewsUpdated, setReviewsUpdated] = useState(false);

  const refreshReviews = () => {
    setReviewsUpdated(true);
    // Reset after a short delay to allow components to react
    setTimeout(() => setReviewsUpdated(false), 100);
  };

  return (
    <ReviewContext.Provider value={{ reviewsUpdated, setReviewsUpdated, refreshReviews }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = (): ReviewContextType => {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
};
