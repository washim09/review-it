// // Note: This component uses a service to fetch user reviews.
// //UserProfilesReviews.tsx
// // This component displays user reviews in a card format with Swiper for image/video slideshows.

import { useEffect, useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, EffectCards } from 'swiper/modules';
import { FaStar, FaEdit, FaTrash, FaImage, FaVideo } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-cards';


interface UserProfileReviewsProps {
  userId: number;
}

interface Review {
  id: number;
  entity: string;
  rating: number;
  content: string;
  imageUrl: string | null;
  videoUrl: string | null;
  author: { 
    id: number;
    name: string;
    email: string;
  };
  tags: string[];
  userId: number;
  createdAt: string;
  updatedAt: string;
}

const UserProfileReviews = ({ userId }: UserProfileReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const baseUrl = 'http://localhost:3000';

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get authentication token
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Authentication token missing');
        }
        
        console.log('Fetching reviews for authenticated user ID:', userId);
        
        // Fetch reviews from the backend API
        const response = await fetch(`http://localhost:3000/api/users/${userId}/reviews`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Handle HTTP errors
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('You are not authorized to view these reviews');
          } else if (response.status === 404) {
            throw new Error('No reviews found');
          } else {
            console.error('Failed to fetch reviews:', response.status, response.statusText);
            throw new Error(`Failed to fetch reviews: ${response.statusText}`);
          }
        }
        
        // Parse and process the review data
        const reviewsData = await response.json();
        console.log(`Loaded ${reviewsData.length} reviews for user ${userId}:`, reviewsData);
        
        // Handle empty reviews array
        if (reviewsData.length === 0) {
          console.log('No reviews found for this user');
        }
        
        // Update the component state with the fetched reviews
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error loading reviews:', error);
        setError(error instanceof Error ? error.message : 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    // Only attempt to load reviews if we have a valid userId
    if (userId > 0) {
      loadReviews();
    } else {
      console.warn('Invalid userId, not fetching reviews');
      setError('Invalid user ID');
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg shadow max-w-md mx-auto text-center">
          <p className="font-semibold mb-2">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (reviews.length === 0 && !loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="bg-blue-50 text-blue-600 p-6 rounded-lg shadow max-w-md mx-auto text-center">
          <p className="font-semibold mb-2">No Reviews Yet</p>
          <p className="text-gray-600 mb-4">You haven't created any reviews yet.</p>
          <button 
            onClick={() => window.location.href = '/create-review'}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Write Your First Review
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Reviews</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"></div>
        </div>

        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-64">
                  <Swiper
                    effect="cards"
                    grabCursor={true}
                    pagination={{
                      dynamicBullets: true,
                    }}
                    navigation={true}
                    modules={[Pagination, Navigation, EffectCards]}
                    className="h-full"
                  >
                    {review.imageUrl && (
                      <SwiperSlide>
                        <div className="relative group">
                          <img
                            src={`${baseUrl}${review.imageUrl}`}
                            alt="Review"
                            className="w-full h-64 object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                            <FaImage className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </SwiperSlide>
                    )}
                    {review.videoUrl && (
                      <SwiperSlide>
                        <div className="relative group">
                          <video controls className="w-full h-64 object-cover">
                            <source src={`${baseUrl}${review.videoUrl}`} type="video/mp4" />
                          </video>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                            <FaVideo className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </SwiperSlide>
                    )}
                  </Swiper>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {review.entity}
                    </h3>
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-700 transition-colors">
                        <FaEdit />
                      </button>
                      <button className="text-red-600 hover:text-red-700 transition-colors">
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, index) => (
                      <FaStar
                        key={index}
                        className={`${
                          index < review.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        } text-lg`}
                      />
                    ))}
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">{review.content}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {review.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>By {review.author.name}</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserProfileReviews;