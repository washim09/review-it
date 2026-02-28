'use client'

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useReviews } from '../../context/ReviewContext';
import { FaArrowLeft, FaArrowRight, FaExclamationCircle, FaPencilAlt } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import { getFullUrl } from '../../utils/getFullUrl';
import { generatePlaceholderImage } from '../../utils/avatarGenerator';
import { isVideoUrl } from '../../utils/mediaUtils';
import { API_BASE_URL } from '../../config/api';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Import ReviewEditModal component
import ReviewEditModal from './ReviewEditModal';

// Review interface
interface Review {
  id: string;
  title: string;
  content: string;
  review: string;
  rating: number;
  createdAt: string;
  productName?: string;
  entity?: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaUrls?: string[];
  mediaTypes?: ('image' | 'video')[];
  tags?: string[];
  author?: {
    id: number;
    name: string;
    imageUrl?: string;
  };
  // Flag to indicate if this is mock data (for UI treatment)
  isMockData?: boolean;
}

const UserProfileReviews = () => {
  // State for reviews, loading indicator, and error message
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // State for managing expanded reviews
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  // State for managing expanded tag lists per review
  const [expandedTagLists, setExpandedTagLists] = useState<Record<string, boolean>>({});

  // Get user and review context
  const { user } = useAuth();
  const reviewContext = useReviews();

  // Helper function to safely prepare a review for the edit modal
  // This handles the type conversion between our Review type and the one expected by ReviewEditModal
  const prepareReviewForEdit = (review: Review | null) => {
    if (!review) return null;

    return {
      id: review.id,
      title: review.title || '',
      content: review.content || '',
      review: review.review || review.content || '',
      rating: review.rating || 0,
      createdAt: review.createdAt || new Date().toISOString(),
      productName: review.productName || review.entity || 'Untitled Product',
      // Optional fields - only include if they exist
      imageUrl: review.imageUrl || '',
      videoUrl: review.videoUrl || '',
      tags: review.tags || [],
      mediaUrls: review.mediaUrls || [],
      mediaTypes: review.mediaTypes || []
    };
  };

  // Handler to open the edit modal for a specific review
  const handleEditReview = (review: Review) => {
    setSelectedReview(review);
    setIsEditModalOpen(true);
  };

  // Helper function to toggle expanded state for review content
  const toggleExpanded = (reviewId: string) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  // Helper function to toggle expanded state for review tags
  const toggleTagsExpanded = (reviewId: string) => {
    setExpandedTagLists(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };
  
  // Add custom scrollbar styles
  useEffect(() => {
    // Add custom scrollbar styles
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #1f1f23;
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #3f3f46;
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #4b5563;
      }
    `;
    document.head.appendChild(style);
    
    // Cleanup function
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Handler for when a review is updated
  const handleReviewUpdated = (updatedReview: Review) => {
    // Convert the updated review back to our local Review type
    const localUpdatedReview: Review = {
      ...updatedReview,
      // Use the updated entity/productName if available, otherwise fall back to original
      entity: updatedReview.entity || updatedReview.productName || selectedReview?.entity || '',
      // Preserve other fields from the original review
      author: selectedReview?.author,
      isMockData: selectedReview?.isMockData
    };

    // Update the reviews array with the updated review
    setReviews(prevReviews => 
      prevReviews.map(review => 
        review.id === updatedReview.id ? localUpdatedReview : review
      )
    );
    
    // Close the modal
    setIsEditModalOpen(false);
    setSelectedReview(null);
  };
  
  // Using imported getFullUrl function from mediaUtils

  // Helper function to parse string or return original value - memoized to prevent re-renders
  const parseJsonStringOrReturn = useCallback((value: unknown): unknown => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return value;
  }, []);

  // Function to render star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`${i <= rating ? 'text-yellow-400' : 'text-neutral-600'} text-xl`}>
          ★
        </span>
      );
    }
    return stars;
  };

  // Fetch user reviews
  const fetchReviews = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setReviews([]); // No user, no reviews
      return;
    }

    try {
      setLoading(true);
      
      // IMPORTANT: Get 'authToken' instead of 'token' based on the backup file
      const token = localStorage.getItem('authToken');

      if (!token) {

        setReviews([]);
        setLoading(false);
        return;
      }
      
      // IMPORTANT: Hard-code the backend API URL to avoid using the frontend URL
      const apiBaseUrl = API_BASE_URL;
      
      // Use the correct API endpoint with the backend URL

      const response = await axios.get(`${apiBaseUrl}/api/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000 // Increase timeout to 15 seconds to avoid timeout issues
      });

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {

        // Process reviews to ensure media URLs are properly formatted
        const processedReviews = response.data.map((review: Review & { mediaUrls?: string | string[]; imageUrls?: string | string[]; videoUrls?: string | string[] }) => {
          // Process mediaUrls - handle different formats from API
          let mediaUrls = review.mediaUrls;
          let imageUrls: string[] = [];
          let videoUrls: string[] = [];
          
          // Image URLs processing
          if (review.imageUrl) {
            // Parse potential JSON string in imageUrl
            const parsedImageUrls = parseJsonStringOrReturn(review.imageUrl);
            
            if (Array.isArray(parsedImageUrls)) {

              imageUrls = parsedImageUrls.map((url: string) => getFullUrl(url));
            } else if (typeof parsedImageUrls === 'string') {

              imageUrls = [getFullUrl(parsedImageUrls)];
            }
          }
          
          // Video URLs processing
          if (review.videoUrl) {
            // Parse potential JSON string in videoUrl
            const parsedVideoUrls = parseJsonStringOrReturn(review.videoUrl);
            
            if (Array.isArray(parsedVideoUrls)) {

              videoUrls = parsedVideoUrls.map((url: string) => getFullUrl(url));
            } else if (typeof parsedVideoUrls === 'string') {

              videoUrls = [getFullUrl(parsedVideoUrls)];
            }
          }
          
          // Process mediaUrls - parse JSON string if needed
          if (typeof mediaUrls === 'string') {
            mediaUrls = parseJsonStringOrReturn(mediaUrls) as string[];
          }
          
          // Ensure mediaUrls is an array
          if (!Array.isArray(mediaUrls)) {
            mediaUrls = mediaUrls ? [mediaUrls] : [];
          }
          
          // If there are separate imageUrl/videoUrl but no mediaUrls,
          // combine them into mediaUrls
          if (mediaUrls.length === 0) {
            mediaUrls = [...imageUrls, ...videoUrls];
          } else {
            // Ensure all URLs in mediaUrls are normalized
            mediaUrls = mediaUrls.map((url: string) => {
              // Skip URLs that are already processed (from imageUrls or videoUrls)
              if (imageUrls.includes(url) || videoUrls.includes(url)) {
                return url;
              }
              return getFullUrl(url);
            });
          }
          
          // Process mediaTypes similarly
          let mediaTypes = review.mediaTypes;
          if (typeof mediaTypes === 'string') {
            mediaTypes = parseJsonStringOrReturn(mediaTypes) as ('image' | 'video')[];
          }
          
          // Ensure mediaTypes is an array matching mediaUrls length
          if (!Array.isArray(mediaTypes) || mediaTypes.length !== mediaUrls.length) {
            mediaTypes = mediaUrls.map((url: string) => {
              return isVideoUrl(url) ? 'video' : 'image';
            });
          }
          
          // Debug logging for media structure after processing

          // Return the processed review
          return {
            ...review,
            mediaUrls,
            mediaTypes,
            isMockData: false // Explicitly mark as real data
          };
        });
        
        // Update state with processed reviews
        setReviews(processedReviews);
      } else {

        setReviews([]);
      }
    } catch (err) {
      console.error('Error fetching user reviews:', err);
      setError('Failed to load reviews');
      
      // Set empty reviews on error

      setReviews([]);
    } finally {
      setLoading(false);
    }
  // Only depend on user.id which should be stable
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Fetch reviews on component mount and when reviewContext changes
  // We intentionally DON'T include fetchReviews in the dependency array to prevent infinite loops
  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewContext.reviewsUpdated]);

  // Show loading state
  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin text-indigo-400 text-xl inline-block mr-2">⟳</div>
        <span>Loading your reviews...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 text-center text-red-400">
        <FaExclamationCircle className="inline-block mr-2" />
      </div>
    );
  }
  
  // Display empty state if no reviews
  if (reviews.length === 0) {
    return (
      <div className="p-8 text-center bg-neutral-800 rounded-lg shadow-lg border border-neutral-700">
        <div className="text-6xl mb-4">✏️</div>
        <h3 className="text-2xl font-semibold mb-3 text-white">No reviews yet</h3>
        <p className="text-neutral-400 text-lg">Your reviews will appear here after you write one.</p>
      </div>
    );
  }

  // Show reviews - using original design with Swiper for media
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
      {reviews.map(review => {
        
        return (
          <div 
            key={review.id}
            className="bg-neutral-800 rounded-lg shadow-lg p-0 overflow-hidden flex flex-col border border-neutral-700 hover:border-purple-500 hover:shadow-purple-900/20 hover:shadow-2xl transition-all duration-300"
          >
            {/* Review Header - Styled like featured cards */}
            <div className="p-4 bg-neutral-800">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-white transition-colors line-clamp-2">{review.title || 'Untitled Review'}</h3>
                <div className="flex items-center mt-1">
                  <div className="flex">{renderStars(review.rating || 0)}</div>
                </div>
              </div>
            </div>

            {/* Review Media */}
            <div className="relative">
              {/* Swiper-based Media Implementation */}
              <div className="relative">
                <Swiper
                  modules={[Navigation, Pagination, A11y]}
                  spaceBetween={0}
                  slidesPerView={1}
                  navigation={{
                    nextEl: `.swiper-button-next-${review.id || 'unknown'}`,
                    prevEl: `.swiper-button-prev-${review.id || 'unknown'}`
                  }}
                  pagination={{
                    clickable: true,
                    el: `.swiper-pagination-${review.id || 'unknown'}`
                  }}
                  className="review-media-swiper h-52 border-b border-neutral-700"
                >
                   {/* First priority: Check for mediaUrls array */}
                  {Array.isArray(review.mediaUrls) && review.mediaUrls.length > 0 ? (
                    review.mediaUrls.map((url, index) => {
                      // Determine if this is a video based on mediaTypes array or URL
                      const isVideo = Array.isArray(review.mediaTypes) && index < review.mediaTypes.length 
                        ? review.mediaTypes[index] === 'video'
                        : isVideoUrl(url);
                          
                      // Process URL differently based on source
                      // URLs should already be processed during the API data handling
                      // but we do an additional check here to be safe
                      let processedUrl = url;
                      
                      // If the URL is from real API data but doesn't already have http:// or https://
                      // (this is a safety check as URLs should already be normalized)
                      if (!url.startsWith('http') && !url.startsWith('data:')) {
                        processedUrl = getFullUrl(url);
                      }
                      
                      // Special handling for URLs that might still have JSON format
                      if (url.startsWith('["') || url.startsWith('[\'/')) {
                        try {
                          // Try parsing it as JSON
                          const parsed = JSON.parse(url);
                          if (Array.isArray(parsed) && parsed.length > 0) {
                            // Use the first URL in the array
                            processedUrl = getFullUrl(parsed[0]);
                          }
                        } catch (e) {
                          // If parsing fails, use as is

                        }
                      }

                      return (
                        <SwiperSlide key={index} className="w-full h-52">
                          {isVideo ? (
                            <div className="w-full h-52 bg-neutral-900 flex items-center justify-center">
                              <video 
                                src={processedUrl}
                                controls 
                                className="w-full h-52 object-cover"
                                onError={(e) => {
                                  // Silently handle missing/invalid videos without console errors
                                  const parent = (e.target as HTMLVideoElement).parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="text-gray-400 text-sm p-4">Video not available</div>';
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-full h-52 bg-neutral-900 flex items-center justify-center">
                              <img 
                                src={processedUrl} 
                                alt={`Media ${index + 1} for ${review.title || 'Review'}`} 
                                className="w-full h-52 object-cover" 
                                loading="eager"
                                onError={(e) => {
                                  console.error(`Error loading image: ${processedUrl}`, e);
                                  const imgElement = e.target as HTMLImageElement;
                                  imgElement.onerror = null;
                                  imgElement.src = generatePlaceholderImage('Image not available');
                                }}
                              />
                            </div>
                          )}
                        </SwiperSlide>
                      );
                    })
                  ) : (
                    // Second priority: Check for single imageUrl or videoUrl
                    <SwiperSlide className="w-full h-52">
                      {review.videoUrl ? (
                        <div className="w-full h-52 bg-neutral-900 flex items-center justify-center">
                          <video
                            src={getFullUrl(review.videoUrl)}
                            controls
                            className="w-full h-52 object-cover"
                            onError={(e) => {
                              console.error(`Error loading single video: ${getFullUrl(review.videoUrl)}`, e);
                              const parent = (e.target as HTMLVideoElement).parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="text-gray-400 text-sm p-4">Video not available</div>';
                              }
                            }}
                          />
                        </div>
                      ) : review.imageUrl ? (
                        <div className="w-full h-52 bg-neutral-900 flex items-center justify-center">
                          <img
                            src={getFullUrl(review.imageUrl)}
                            alt={`Image for ${review.title || 'Review'}`}
                            className="w-full h-52 object-cover"
                            onError={(e) => {
                              console.error(`Error loading single image: ${getFullUrl(review.imageUrl)}`, e);
                              const imgElement = e.target as HTMLImageElement;
                              imgElement.onerror = null;
                              imgElement.src = generatePlaceholderImage('Image not available');
                            }}
                          />
                        </div>
                      ) : (
                        // Fallback placeholder for reviews without media
                        <div className="w-full h-52 bg-gradient-to-r from-neutral-900 to-purple-900/20 flex items-center justify-center">
                          <div className="text-6xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                            {(review.title || 'Review').substring(0, 2).toUpperCase()}
                          </div>
                        </div>
                      )}
                    </SwiperSlide>
                  )}
                </Swiper>
                
                {/* Custom Navigation Arrows - Only show if more than one media */}
                {Array.isArray(review.mediaUrls) && review.mediaUrls.length > 1 && (
                  <>
                    <div className={`swiper-button-prev-${review.id || 'unknown'} absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full cursor-pointer hover:bg-black/70 transition-all`}>
                      <FaArrowLeft className="text-sm" />
                    </div>
                    <div className={`swiper-button-next-${review.id || 'unknown'} absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full cursor-pointer hover:bg-black/70 transition-all`}>
                      <FaArrowRight className="text-sm" />
                    </div>
                  </>
                )}
                
                {/* Pagination Dots */}
                {Array.isArray(review.mediaUrls) && review.mediaUrls.length > 1 && (
                  <div className={`swiper-pagination swiper-pagination-${review.id || 'unknown'} absolute bottom-2 left-0 right-0 z-10 flex justify-center space-x-1`}></div>
                )}
              </div>
            </div>

            {/* Review Content - Styled like featured cards */}
            <div className="p-4 bg-neutral-800">
              {/* Product Name (Entity) Display as heading */}
              {(review.entity || review.productName) && (
                <h2 className="text-white font-medium text-xl mb-2">{review.entity || review.productName}</h2>
              )}
              
              {/* Review content with fallbacks and Read More functionality */}
              {(review.content || review.review) ? (
                <div className="mb-3">
                  <div className={`text-gray-300 ${review?.id && expandedReviews && expandedReviews[review.id] ? 'max-h-40 overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
                    {review?.id && expandedReviews && expandedReviews[review.id] ? (
                      <>
                        {review.content || review.review}
                        <div className="mt-2 text-right">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              review?.id && toggleExpanded(review.id);
                            }}  
                            className="text-xs font-medium text-purple-500 hover:text-purple-400"
                          >
                            Show Less
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {(review.content || review.review).length > 150
                          ? `${(review.content || review.review).substring(0, 150)}... `
                          : (review.content || review.review)
                        }
                        {(review.content || review.review).length > 150 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              review?.id && toggleExpanded(review.id);
                            }}
                            className="text-indigo-400 hover:text-indigo-300 font-medium ml-1"
                          >
                            Read More
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <p className="italic text-gray-500 mb-3">No review content available</p>
              )}
              
              {/* Tags */}
              {review.tags && review.tags.length > 0 && (
                <div
                  className={`flex flex-wrap gap-1 mt-3 min-h-[24px] ${
                    expandedTagLists[review.id]
                      ? 'max-h-24 overflow-y-auto pr-1 custom-scrollbar'
                      : ''
                  }`}
                >
                  {(expandedTagLists[review.id] ? review.tags : review.tags.slice(0, 3)).map((tag, index) => (
                    <span key={index} className="bg-blue-900/50 text-blue-300 text-xs px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}

                  {review.tags.length > 3 && (
                    <button
                      type="button"
                      onClick={() => toggleTagsExpanded(review.id)}
                      className="bg-blue-900/30 text-blue-200 text-xs px-2 py-0.5 rounded-full hover:bg-blue-900/40 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                      aria-expanded={!!expandedTagLists[review.id]}
                      aria-label={
                        expandedTagLists[review.id]
                          ? 'Show fewer tags'
                          : `Show ${review.tags.length - 3} more tags`
                      }
                    >
                      {expandedTagLists[review.id] ? 'Show less' : `+${review.tags.length - 3} more`}
                    </button>
                  )}
                </div>
              )}
              
              {/* Footer - styled like featured cards */}
              <div className="mt-3 pt-3 flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                </div>
                <button 
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-2 py-1 rounded flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditReview(review);
                  }}
                >
                  <FaPencilAlt className="mr-1" size={10} />
                  Edit
                </button>
              </div>
            </div>
          </div>
        );
      })}

    {/* Review Edit Modal */}
    {isEditModalOpen && selectedReview && (
      <ReviewEditModal 
        isOpen={isEditModalOpen}
        review={prepareReviewForEdit(selectedReview) as any} /* Use the helper function with type assertion */
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedReview(null);
        }}
        onSave={handleReviewUpdated}
      />
    )}
    </div>
  );
};

export default UserProfileReviews;
