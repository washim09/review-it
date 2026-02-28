'use client'

import { useState, useEffect } from 'react';
import { FaThumbsUp, FaShare, FaComment, FaChevronLeft, FaChevronRight, FaFacebook, FaWhatsapp, FaLinkedin, FaLink, FaCheck } from 'react-icons/fa';
import XIcon from '../icons/XIcon';
import ComposeMessageModal from '../messages/ComposeMessageModal';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getMediaUrl, isVideoUrl } from '../../utils/mediaUtils';
import { generateLocalAvatar, generatePlaceholderImage } from '../../utils/avatarGenerator';
import { Review } from '../../types';
import AuthModal from '../../components/modals/AuthModal';
import { API_BASE_URL } from '../../config/api';
// Import mock data as fallback (optional)
// import mockReviews from '../../data/mockReviewsLocal';

const FeaturedReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedReviews, setLikedReviews] = useState<{[key: string]: boolean}>({});
  const [likeCounts, setLikeCounts] = useState<{[key: string]: number}>({});
  const [expandedReviews, setExpandedReviews] = useState<{[key: string]: boolean}>({});
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeSlides, setActiveSlides] = useState<{[key: string]: number}>({});
  const [copiedLink, setCopiedLink] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<{ id: number; name: string } | null>(null);
  const { isAuthenticated: isAuth } = useAuth();
  const router = useRouter();

  // Function to fetch like counts for all reviews
  const fetchLikeCounts = async (reviewIds: string[]) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${API_BASE_URL}/api/reviews/like-counts`,
        { reviewIds },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }
      );
      setLikeCounts(prev => ({
        ...prev,
        ...response.data
      }));
    } catch (error) {
      // Silent fail for like counts
    }
  };

  useEffect(() => {
    // Fetch latest reviews from the API (newest first)
    const fetchReviews = async () => {
      try {
        setLoading(true);
        
        // Fetch latest reviews from the backend API (sorted by newest first)
        const response = await axios.get(`${API_BASE_URL}/api/reviews/latest`, {
          timeout: 10000
        });


        // Process the reviews to ensure media URLs are properly formatted
        const processedReviews = response.data.map((review: any) => {
          // Create a new review object to avoid mutations
          const processedReview = { ...review };
          
          // Process author image
          if (processedReview.author) {
            processedReview.author = { ...processedReview.author };
            if (processedReview.author.imageUrl) {
              processedReview.author.imageUrl = getMediaUrl(processedReview.author.imageUrl);
            } else if (processedReview.author.profileImage) {
              processedReview.author.imageUrl = getMediaUrl(processedReview.author.profileImage);
            }
          }
          

          // Backend now always returns mediaUrls as a parsed array
          // Just ensure we have an array to work with
          const mediaUrlsFromBackend = Array.isArray(review.mediaUrls) ? review.mediaUrls : [];

          // Process all media URLs through getMediaUrl
          let processedMediaUrls: string[] = [];

          if (mediaUrlsFromBackend.length > 0) {
            // Process all URLs in mediaUrls array, filtering out empty/invalid ones
            processedMediaUrls = mediaUrlsFromBackend
              .filter((url: any) => url && typeof url === 'string' && url.trim() !== '')
              .map((url: string) => getMediaUrl(url))
              .filter((url: string) => url && url !== ''); // Remove any that became empty after processing
          } else {
            // Fallback: if no mediaUrls, create one from imageUrl/videoUrl
            const mediaList: string[] = [];
            
            // Handle imageUrl (might be JSON string)
            if (review.imageUrl) {
              let imageUrl = review.imageUrl;
              if (typeof imageUrl === 'string' && imageUrl.startsWith('[')) {
                try {
                  const parsed = JSON.parse(imageUrl);
                  imageUrl = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : imageUrl;
                } catch (e) {
                  // Use as is
                }
              }
              if (typeof imageUrl === 'string' && imageUrl.trim() !== '') {
                const processed = getMediaUrl(imageUrl);
                if (processed) mediaList.push(processed);
              }
            }
            
            // Handle videoUrl (might be JSON string)
            if (review.videoUrl) {
              let videoUrl = review.videoUrl;
              if (typeof videoUrl === 'string' && videoUrl.startsWith('[')) {
                try {
                  const parsed = JSON.parse(videoUrl);
                  videoUrl = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : videoUrl;
                } catch (e) {
                  // Use as is
                }
              }
              if (typeof videoUrl === 'string' && videoUrl.trim() !== '') {
                const processed = getMediaUrl(videoUrl);
                if (processed) mediaList.push(processed);
              }
            }
            
            processedMediaUrls = mediaList;
          }
          
          // Set the processed mediaUrls on the new review object
          processedReview.mediaUrls = processedMediaUrls;
          
          // Return the processed review
          return processedReview;
        });
        
        // Sort reviews by createdAt in descending order (newest first)
        const sortedReviews = processedReviews.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Descending order (newest first)
        });
        
        setReviews(sortedReviews);
        
        // Fetch like counts for the loaded reviews
        if (processedReviews.length > 0) {
          const reviewIds = processedReviews.map((review: { id: { toString: () => any; }; }) => review.id.toString());
          fetchLikeCounts(reviewIds);
        }
      } catch (error) {
        // Show empty state instead of mock data for production
        // If you want to use mock data as fallback, uncomment the next line:
        // setReviews(mockReviews as unknown as Review[]);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleLike = async (reviewId: string) => {
    if (!isAuth) {
      setShowAuthModal(true);
      return;
    }
    
    const isLiked = !likedReviews[reviewId];
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      if (isLiked) {
        // Like the review
        await axios.post(
          `${API_BASE_URL}/api/reviews/${reviewId}/like`,
          {},
          { headers }
        );
      } else {
        // Unlike the review
        await axios.delete(
          `${API_BASE_URL}/api/reviews/${reviewId}/like`,
          { headers }
        );
      }
      
      // Update the UI optimistically
      setLikedReviews(prev => ({
        ...prev,
        [reviewId]: isLiked
      }));
      
      // Update the like count
      setLikeCounts(prev => ({
        ...prev,
        [reviewId]: (prev[reviewId] || 0) + (isLiked ? 1 : -1)
      }));
      
    } catch (error) {
      // Revert the UI on error
      setLikedReviews(prev => ({
        ...prev,
        [reviewId]: !prev[reviewId]
      }));
    }
  };

  const handleShare = (reviewId: string) => {
    if (!isAuth) {
      setShowAuthModal(true);
      return;
    }
    setShowShareModal(reviewId);
    setCopiedLink(false);
  };

  const getReviewUrl = (reviewId: string) => {
    return `${window.location.origin}/review/${reviewId}`;
  };

  const getShareText = (review: Review) => {
    return `Check out this review: ${review.title || 'Amazing Review'} - ${review.content || review.review || ''} on Riviewit`;
  };

  const handleShareFacebook = (reviewId: string) => {
    const review = reviews.find(r => r.id.toString() === reviewId);
    if (!review) return;
    
    const url = getReviewUrl(reviewId);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleShareX = (reviewId: string) => {
    const review = reviews.find(r => r.id.toString() === reviewId);
    if (!review) return;
    
    const url = getReviewUrl(reviewId);
    const text = getShareText(review);
    const xUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(xUrl, '_blank', 'width=600,height=400');
  };

  const handleShareWhatsApp = (reviewId: string) => {
    const review = reviews.find(r => r.id.toString() === reviewId);
    if (!review) return;
    
    const url = getReviewUrl(reviewId);
    const text = getShareText(review);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareLinkedIn = (reviewId: string) => {
    const review = reviews.find(r => r.id.toString() === reviewId);
    if (!review) return;
    
    const url = getReviewUrl(reviewId);
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async (reviewId: string) => {
    const url = getReviewUrl(reviewId);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      // Silent fail for clipboard
    }
  };

  const toggleExpanded = (reviewId: string) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
      </svg>
    ));
  };

  if (loading) {
    return (
      <section className="bg-neutral-950 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Featured Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-neutral-900 rounded-lg animate-pulse">
                <div className="h-52 bg-neutral-800"></div>
                <div className="p-4">
                  <div className="h-6 bg-neutral-800 rounded mb-2"></div>
                  <div className="h-4 bg-neutral-800 rounded mb-4"></div>
                  <div className="h-20 bg-neutral-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-reviews" className="bg-neutral-950 py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-white text-center mb-12">Featured Reviews</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.length > 0 ? reviews.map((review) => (
            <div 
              key={review.id}
              className="bg-neutral-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500/50 transition-all duration-300 cursor-pointer group"
              onClick={() => isAuth ? router.push(`/review/${review.id}`) : setShowAuthModal(true)}
            >
              {/* Review Header */}
              <div className="p-4 border-b border-neutral-700 bg-gradient-to-r from-neutral-900 to-neutral-800">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                    {review?.title || 'Untitled Review'}
                  </h3>
                  {review?.author && (
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-700 border-2 border-purple-600/30">
                      <img
                        src={review.author.profileImage || review.author.imageUrl || generateLocalAvatar(review.author.name || 'User')}
                        alt={review.author.name || 'Unknown User'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = generateLocalAvatar(review.author?.name || 'User');
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-start mt-1">
                  <div className="flex">{renderStars(review?.rating || 0)}</div>
                </div>
              </div>

              {/* Review Media with Carousel */}
              <div className="h-52 bg-neutral-900 relative" onClick={(e) => e.stopPropagation()}>
                {(() => {
                  // Use mediaUrls array which contains all media (processed in useEffect)
                  const hasMedia = Array.isArray(review.mediaUrls) && review.mediaUrls.length > 0;
                  
                  if (!hasMedia || !review.mediaUrls) {
                    return <div className="flex items-center justify-center h-full text-gray-400 text-sm">No media available</div>;
                  }
                  
                  const currentSlide = activeSlides[review.id] || 0;
                  
                  // mediaUrls is already a processed array from useEffect
                  const currentMediaUrl = review.mediaUrls ? review.mediaUrls[currentSlide] : '';
                  const hasMultipleMedia = Array.isArray(review.mediaUrls) && review.mediaUrls.length > 1;
                  
                  const handlePrevSlide = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (!review.mediaUrls) return;
                    const newIndex = currentSlide === 0 ? review.mediaUrls.length - 1 : currentSlide - 1;
                    setActiveSlides(prev => ({ ...prev, [review.id]: newIndex }));
                  };
                  
                  const handleNextSlide = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (!review.mediaUrls) return;
                    const newIndex = currentSlide === review.mediaUrls.length - 1 ? 0 : currentSlide + 1;
                    setActiveSlides(prev => ({ ...prev, [review.id]: newIndex }));
                  };
                  
                  return (
                    <>
                      {/* Media Display */}
                      <div className="w-full h-full flex items-center justify-center">
                        {isVideoUrl(currentMediaUrl) ? (
                          <video
                            key={currentMediaUrl}
                            src={currentMediaUrl}
                            controls
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLVideoElement;
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="text-gray-400 text-sm p-4">Video not available</div>';
                              }
                            }}
                          />
                        ) : (
                          <img
                            key={currentMediaUrl}
                            src={currentMediaUrl}
                            alt={`${review.title || 'Review'} - Image ${currentSlide + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = generatePlaceholderImage('Image not available');
                            }}
                          />
                        )}
                      </div>
                      
                      {/* Carousel Controls */}
                      {hasMultipleMedia && (
                        <>
                          {/* Previous Button */}
                          <button
                            onClick={handlePrevSlide}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                            aria-label="Previous image"
                          >
                            <FaChevronLeft className="text-sm" />
                          </button>
                          
                          {/* Next Button */}
                          <button
                            onClick={handleNextSlide}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                            aria-label="Next image"
                          >
                            <FaChevronRight className="text-sm" />
                          </button>
                          
                          {/* Dots Indicator */}
                          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                            {review.mediaUrls?.map((_, index) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveSlides(prev => ({ ...prev, [review.id]: index }));
                                }}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  index === currentSlide
                                    ? 'bg-white w-6'
                                    : 'bg-white/50 hover:bg-white/70'
                                }`}
                                aria-label={`Go to image ${index + 1}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Review Content */}
              <div className="p-4">
                <h4 className="text-white font-medium mb-2">{review?.entity || 'Product'}</h4>
                <div className="text-gray-300 mb-4">
                  {(() => {
                    // Use 'review' field if available, otherwise fallback to 'content'
                    const reviewText = review.review || review.content || 'No review text available';
                    const isLongText = reviewText.length > 150;
                    
                    if (expandedReviews[review.id]) {
                      return (
                        <>
                          {reviewText}
                          {isLongText && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(review.id.toString());
                              }}
                              className="text-purple-500 hover:text-purple-400 ml-2 text-sm"
                            >
                              Show Less
                            </button>
                          )}
                        </>
                      );
                    } else {
                      return (
                        <>
                          {isLongText ? `${reviewText.substring(0, 150)}...` : reviewText}
                          {isLongText && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(review.id.toString());
                              }}
                              className="text-purple-500 hover:text-purple-400 ml-2 text-sm"
                            >
                              Read More
                            </button>
                          )}
                        </>
                      );
                    }
                  })()}
                </div>

                {/* Tags */}
                {review.tags && review.tags.length > 0 && (
  <div className="flex flex-wrap gap-2 mb-4">
    {review.tags.slice(0, 3).map((tag, index) => (
      <span
        key={index}
        className="bg-blue-900/40 text-blue-300 text-xs px-2 py-1 rounded-full"
      >
        #{tag}
      </span>
    ))}

    {review.tags.length > 3 && (
      <span className="bg-blue-900/20 text-blue-200 text-xs px-2 py-1 rounded-full">
        +{review.tags.length - 3} more
      </span>
    )}
  </div>
)}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-3 border-t border-neutral-700/50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(review.id.toString());
                    }}
                    className={`flex items-center px-3 py-1 rounded-full text-xs ${
                      likedReviews[review.id] ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <FaThumbsUp className="mr-1" />
                    {likedReviews[review.id] ? 'Liked' : 'Like'}
                    {likeCounts[review.id] > 0 && (
                      <span className="ml-1">{likeCounts[review.id]}</span>
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(review.id.toString());
                    }}
                    className="flex items-center px-3 py-1 rounded-full text-xs text-gray-400 hover:text-white"
                  >
                    <FaShare className="mr-1" />
                    Share
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isAuth) {
                        setShowAuthModal(true);
                      } else if (review.author) {
                        setMessageRecipient({
                          id: review.author.id,
                          name: review.author.name
                        });
                      }
                    }}
                    className="flex items-center px-3 py-1 rounded-full text-xs text-gray-400 hover:text-white"
                  >
                    <FaComment className="mr-1" />
                    Message
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 mb-6 rounded-full bg-neutral-800 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Reviews Yet</h3>
              <p className="text-gray-400 text-center max-w-md">
                Be the first to share your experience! Reviews from our community will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Share Modal */}
      {showShareModal && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowShareModal(null)}
        >
          <div 
            className="bg-neutral-800 rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-2">Share Review</h3>
            <p className="text-gray-400 text-sm mb-6">Share this review on your favorite platform</p>
            
            {/* Social Media Share Buttons */}
            <div className="space-y-3 mb-6">
              {/* Facebook */}
              <button
                onClick={() => handleShareFacebook(showShareModal)}
                className="w-full flex items-center gap-4 px-4 py-3 bg-[#1877F2] hover:bg-[#166FE5] rounded-lg text-white transition-colors"
              >
                <FaFacebook className="text-2xl" />
                <span className="font-medium">Share on Facebook</span>
              </button>

              {/* X (Twitter) */}
              <button
                onClick={() => handleShareX(showShareModal)}
                className="w-full flex items-center gap-4 px-4 py-3 bg-black hover:bg-neutral-900 rounded-lg text-white transition-colors"
              >
                <XIcon className="w-6 h-6" />
                <span className="font-medium">Share on X</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => handleShareWhatsApp(showShareModal)}
                className="w-full flex items-center gap-4 px-4 py-3 bg-[#25D366] hover:bg-[#22C55E] rounded-lg text-white transition-colors"
              >
                <FaWhatsapp className="text-2xl" />
                <span className="font-medium">Share on WhatsApp</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => handleShareLinkedIn(showShareModal)}
                className="w-full flex items-center gap-4 px-4 py-3 bg-[#0A66C2] hover:bg-[#095196] rounded-lg text-white transition-colors"
              >
                <FaLinkedin className="text-2xl" />
                <span className="font-medium">Share on LinkedIn</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={() => handleCopyLink(showShareModal)}
                className="w-full flex items-center gap-4 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white transition-colors"
              >
                {copiedLink ? (
                  <>
                    <FaCheck className="text-2xl text-green-400" />
                    <span className="font-medium text-green-400">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <FaLink className="text-2xl" />
                    <span className="font-medium">Copy Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowShareModal(null)}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Compose Message Modal */}
      {messageRecipient && (
        <ComposeMessageModal
          recipientId={messageRecipient.id}
          recipientName={messageRecipient.name}
          onClose={() => setMessageRecipient(null)}
          onSuccess={() => {
            setMessageRecipient(null);
          }}
        />
      )}
    </section>
  );
};

export default FeaturedReviews;
