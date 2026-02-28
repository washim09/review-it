'use client'

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { FaStar, FaRegStar, FaArrowLeft, FaUser, FaCalendarAlt, FaTag } from 'react-icons/fa';
import Navbar from '../components/layout/Navbar';
import { getToken } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getMediaUrl as getFullUrl, isVideoUrl } from '../utils/mediaUtils';
import { API_BASE_URL } from '../config/api';

interface ReviewDetail {
  id: number;
  title: string;
  entity: string;
  content: string;  // Brief summary
  review: string;   // Detailed review text
  rating: number;
  imageUrl?: string;
  videoUrl?: string;
  tags: string[];
  createdAt: string;
  mediaUrls?: string[];
  mediaTypes?: ('image' | 'video')[];
  author: {
    id: number;
    name: string;
    email: string;
    imageUrl?: string;
  };
}

const ReviewDetailPage = () => {
  const params = useParams();
  const id = (params?.id as string) ?? '';
  const router = useRouter();
  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaTypes, setMediaTypes] = useState<('image' | 'video')[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<number>(0);
  // Add a state to track failed media URLs to prevent infinite error loops
  const [failedMediaUrls, setFailedMediaUrls] = useState<Set<string>>(new Set());
  // Access this ref to track if component is still mounted
  const isMounted = useRef(true);

  // Parse a JSON string or return the original string if it's not JSON
  // This implementation matches the successful approach used in FeaturedReviews
  const parseJsonStringOrReturn = (str: string | undefined): string[] => {
    if (!str) return [];
    
    // If it's already an array, return it
    if (Array.isArray(str)) {

      return str.filter(item => !!item);
    }
    
    if (typeof str !== 'string') {

      return [];
    }
    
    // Clean up the string (remove quotes around the entire string)
    const cleanStr = str.trim();

    try {
      // Special case for JSON array formatted as a string with extra quotes
      // E.g., "[\"url1\",\"url2\"]" or '[\"url1\",\"url2\"]'
      if ((cleanStr.startsWith('"[') && cleanStr.endsWith(']"')) || 
          (cleanStr.startsWith('\'[') && cleanStr.endsWith(']\'')) ||
          (cleanStr.startsWith('[') && cleanStr.endsWith(']'))) {
          
        // Need to handle different quoting scenarios
        let jsonStr = cleanStr;
        if (cleanStr.startsWith('"[')) {
          jsonStr = cleanStr.substring(1, cleanStr.length - 1);
        } else if (cleanStr.startsWith('\'[')) {
          jsonStr = cleanStr.substring(1, cleanStr.length - 1);
        }
        
        try {
          const parsed = JSON.parse(jsonStr);
          if (Array.isArray(parsed)) {
            // Got a valid array from the JSON
            const filteredUrls = parsed.filter(item => !!item && typeof item === 'string');

            return filteredUrls;
          }
        } catch (innerError) {

        }
      }
      
      // Try parsing the entire string as JSON directly
      const parsed = JSON.parse(cleanStr);
      if (parsed) {
        if (Array.isArray(parsed)) {
          const filteredUrls = parsed.filter(item => !!item && typeof item === 'string');

          return filteredUrls;
        } else if (typeof parsed === 'string') {

          return [parsed];
        } else if (typeof parsed === 'object' && parsed !== null) {
          // Handle unexpected object cases

          return [JSON.stringify(parsed)];
        }
      }
      
      // If we get here, parsing worked but returned something we don't handle

      return [cleanStr];
      
    } catch (error) {
      // Fall back to treating as a simple string

      return cleanStr ? [cleanStr] : [];
    }
  };

  // Using imported getFullUrl from mediaUtils

  // Check if a URL is valid and can be used
  const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    // Ignore empty strings and data URLs that are incomplete
    if (url === '' || (url.startsWith('data:') && url.length < 100)) {
      return false;
    }
    try {
      // Try to create a URL object to validate
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // Generate a data URL for avatar fallbacks to avoid external service dependencies
  const generateAvatarDataUrl = (name: string): string => {
    // Create a hash from the name to get a consistent color
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    const color = `hsl(${hue}, 70%, 40%)`;
    
    // Get initials (up to 2 characters)
    const initials = name.split(/\s+/)
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
    
    // Create an SVG with the background color and initials
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <rect width="40" height="40" rx="20" fill="${color}" />
        <text x="20" y="20" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="central">${initials}</text>
      </svg>
    `;
    
    // Convert SVG to data URL
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Reset failed media URLs when id changes
    setFailedMediaUrls(new Set());
    
    const fetchReview = async () => {
      if (!id) return;

      // Set loading state and clear previous errors
      setLoading(true);
      setError(null);
      
      // Get authentication token (optional for viewing reviews)
      const token = getToken();
      // Reviews are publicly accessible - no login required

      // Ensure we're using the correct API base URL and that ID is treated as a number
      const apiBaseUrl = API_BASE_URL;
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        setError('Invalid review ID format');
        setLoading(false);
        return;
      }
      
      const reviewUrl = `${apiBaseUrl}/api/reviews/${numericId}`;

      // Create a controller to handle timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        // Make API request with proper CORS configuration
        const headers: Record<string, string> = { 
          'Content-Type': 'application/json'
        };
        
        // Add auth header only if token exists (for like/comment actions)
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await axios.get(reviewUrl, {
          headers,
          withCredentials: true,
          signal: controller.signal
        });
        
        // Clear timeout once request completes
        clearTimeout(timeoutId);
        
        if (!response.data) {
          setError('No data received from server');
          setLoading(false);
          return;
        }

        setReview(response.data);
        
        // Process all media URLs
        let processedUrls: string[] = [];
        let processedTypes: ('image' | 'video')[] = [];
          
          // First check mediaUrls array from API (preferred source)
          if (response.data.mediaUrls && Array.isArray(response.data.mediaUrls)) {
            // Pre-validate and clean URLs before processing them
            const validMediaUrls = response.data.mediaUrls
              .filter((url: string) => typeof url === 'string' && url.trim() !== '')
              .map((url: string) => url.trim());

            validMediaUrls.forEach((url: string) => {
              try {
                const isVideo = isVideoUrl(url);
                const isImage = !isVideo;
                
                if (isImage || isVideo) {
                  const fullUrl = getFullUrl(url);
                  if (fullUrl && isValidUrl(fullUrl) && !processedUrls.includes(fullUrl)) {
                    processedUrls.push(fullUrl);
                    processedTypes.push(isImage ? 'image' : 'video');
                  }
                }
              } catch (e) {
                // Silently skip invalid URLs to prevent console spam
              }
            });
          }

          // Process imageUrl field if available - following same approach as FeaturedReviews
          if (response.data.imageUrl) {

            let imageUrls: string[] = [];
            
            // Handle different formats - could be array, JSON string, or plain string
            if (Array.isArray(response.data.imageUrl)) {
              // It's already an array

              imageUrls = response.data.imageUrl;
            } else if (typeof response.data.imageUrl === 'string') {
              // Try to parse as JSON array string first
              try {
                // Use our enhanced parser that handles various JSON string formats
                imageUrls = parseJsonStringOrReturn(response.data.imageUrl);

              } catch (e) {

                // Just use as a single URL
                if (response.data.imageUrl.trim()) {
                  imageUrls = [response.data.imageUrl];
                }
              }
            }
            
            // Process each URL in the array
            imageUrls.forEach(url => {
              if (!url || typeof url !== 'string') return;
              const trimmedUrl = url.trim();
              const fullUrl = getFullUrl(trimmedUrl);

              // Only add valid, non-duplicate URLs
              if (fullUrl && isValidUrl(fullUrl) && !processedUrls.includes(fullUrl)) {
                processedUrls.push(fullUrl);
                processedTypes.push('image');
              }
            });
          }

          // Process videoUrl field if available - following same approach as FeaturedReviews
          if (response.data.videoUrl) {

            let videoUrls: string[] = [];
            
            // Handle different formats - could be array, JSON string, or plain string
            if (Array.isArray(response.data.videoUrl)) {
              // It's already an array

              videoUrls = response.data.videoUrl;
            } else if (typeof response.data.videoUrl === 'string') {
              // Try to parse as JSON array string first
              try {
                // Use our enhanced parser that handles various JSON string formats
                videoUrls = parseJsonStringOrReturn(response.data.videoUrl);

              } catch (e) {

                // Just use as a single URL
                if (response.data.videoUrl.trim()) {
                  videoUrls = [response.data.videoUrl];
                }
              }
            }
            
            // Process each URL in the array
            videoUrls.forEach(url => {
              if (!url || typeof url !== 'string') return;
              const trimmedUrl = url.trim();
              const fullUrl = getFullUrl(trimmedUrl);

              // Only add valid, non-duplicate URLs
              if (fullUrl && isValidUrl(fullUrl) && !processedUrls.includes(fullUrl)) {
                processedUrls.push(fullUrl);
                processedTypes.push('video');
              }
            });
          }

        setMediaUrls(processedUrls);
        setMediaTypes(processedTypes);
      } catch (error: unknown) {
        console.error('Error fetching review:', error);
        clearTimeout(timeoutId); // Make sure to clear timeout in catch block
        
        if (axios.isCancel(error)) {
          setError('Request timed out. Please try again.');
        } else {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            setError('Unauthorized: Please login again');
            // Optionally redirect to login
            router.push(`/login?from=/review/${id}`);
          } else if (axiosError.response?.status === 403) {
            setError('You do not have permission to view this review');
          } else if (axiosError.response?.status === 404) {
            setError('Review not found');
          } else {
            const networkError = error as { code?: string; message?: string; response?: { data?: { message?: string } } };
            if (networkError.code === 'ERR_NETWORK') {
              setError('Network error: Check your connection and make sure the API server is running');
            } else {
              setError(networkError.response?.data?.message || networkError.message || 'Failed to fetch review');
            }
          }
        }
        setLoading(false);
      } finally {
        setLoading(false);
        // Make sure component is still mounted before updating state
        if (!isMounted.current) {

        }
      }
    };

    fetchReview();
  }, [id, router]); // id and router are from useParams and useRouter hooks

  // Navigation functions removed - using static display instead

  const renderRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="text-xl">
        {i < rating ? (
          <FaStar className="text-yellow-400" />
        ) : (
          <FaRegStar className="text-gray-400" />
        )}
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[70vh]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-indigo-400 hover:text-indigo-300 mb-4"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl text-red-500">Error</h2>
            <p className="mt-2">{error || 'Review not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    {review && (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Review",
        "url": `https://riviewit.com/review/${review.id}`,
        "itemReviewed": {
          "@type": "Product",
          "name": review.title,
          "image": mediaUrls.length > 0 ? mediaUrls[0] : "",
          "description": review.content,
        },
        "author": {
          "@type": "Person",
          "name": review.author.name,
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating,
          "bestRating": "5"
        },
        "datePublished": review.createdAt,
        "reviewBody": review.review,
      })
    }}
  />
)}
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-indigo-400 hover:text-indigo-300 mb-4"
        >
          <FaArrowLeft className="mr-2" /> Back to reviews
        </button>

        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          {/* Header section with title and rating */}
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-3xl text-white font-bold mb-2">{review.title}</h1>
          </div>

          {/* Media display section - Clean gallery layout without overlays */}
          {mediaUrls.length > 0 && (
            <div className="border-b border-gray-700">
              {/* Main Image/Video Display */}
              <div className="relative w-full bg-gray-850">
                <div className="flex justify-center items-center p-4">
                  {/* Fixed-size container with consistent dimensions */}
                  <div className="relative w-full h-[400px] flex justify-center items-center overflow-hidden">
                    <div className="w-[600px] h-[400px] relative flex justify-center items-center bg-gray-850 rounded">
                      {mediaTypes[selectedMedia] === 'image' ? (
                        <img
                          src={failedMediaUrls.has(mediaUrls[selectedMedia]) ? 
                            'https://via.placeholder.com/600x400?text=Image+Not+Available' : 
                            mediaUrls[selectedMedia]}
                          alt={`Review media ${selectedMedia + 1}`}
                          className="w-full h-full object-contain rounded"
                          style={{ maxWidth: '600px', maxHeight: '400px' }}
                          onError={(e) => {
                            e.preventDefault();
                            if (!failedMediaUrls.has(mediaUrls[selectedMedia]) && isMounted.current) {

                              setFailedMediaUrls(prevUrls => {
                                const newUrls = new Set(prevUrls);
                                newUrls.add(mediaUrls[selectedMedia]);
                                return newUrls;
                              });
                            }
                            if (e.currentTarget) {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Image+Not+Available';
                            }
                          }}
                        />
                      ) : (
                        <video
                          src={failedMediaUrls.has(mediaUrls[selectedMedia]) ? undefined : mediaUrls[selectedMedia]}
                          className="w-full h-full object-contain rounded"
                          style={{ maxWidth: '600px', maxHeight: '400px' }}
                          controls
                          controlsList="nodownload"
                          onError={(e) => {
                            e.preventDefault();
                            if (!failedMediaUrls.has(mediaUrls[selectedMedia]) && isMounted.current) {

                              setFailedMediaUrls(prevUrls => {
                                const newUrls = new Set(prevUrls);
                                newUrls.add(mediaUrls[selectedMedia]);
                                return newUrls;
                              });
                            }
                            if (e.currentTarget) {
                              e.currentTarget.onerror = null;
                            }
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  </div>
                  
                    {/* Navigation Arrows */}
                    {mediaUrls.length > 1 && (
                      <>
                        <button 
                          onClick={() => setSelectedMedia(prev => (prev === 0 ? mediaUrls.length - 1 : prev - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-all z-10 shadow-lg"
                          aria-label="Previous image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => setSelectedMedia(prev => (prev === mediaUrls.length - 1 ? 0 : prev + 1))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-all z-10 shadow-lg"
                          aria-label="Next image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              
                {/* Thumbnails */}
                {mediaUrls.length > 1 && (
                  <div className="p-4 bg-gray-800">
                    <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent justify-center">
                      {mediaUrls.map((url, index) => (
                      <div 
                        key={`thumb-${index}`}
                        onClick={() => setSelectedMedia(index)}
                        className={`relative flex-shrink-0 w-24 h-24 rounded overflow-hidden cursor-pointer transition-all ${selectedMedia === index ? 'ring-2 ring-indigo-500 opacity-100' : 'opacity-70 hover:opacity-100'}`}
                      >
                        <div className="w-24 h-24 bg-gray-850 flex items-center justify-center overflow-hidden">
                          {mediaTypes[index] === 'image' ? (
                            <img
                              src={failedMediaUrls.has(url) ? 
                                'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22300%22%20height%3D%22200%22%20fill%3D%22%232d3748%22%2F%3E%3Ctext%20x%3D%22150%22%20y%3D%22100%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20fill%3D%22%23ffffff%22%3ENA%3C%2Ftext%3E%3C%2Fsvg%3E' 
                                : url}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                if (e.currentTarget) {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22300%22%20height%3D%22200%22%20fill%3D%22%232d3748%22%2F%3E%3Ctext%20x%3D%22150%22%20y%3D%22100%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20fill%3D%22%23ffffff%22%3ENA%3C%2Ftext%3E%3C%2Fsvg%3E';
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-neutral-700 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        {selectedMedia === index && (
                          <div className="absolute inset-0 border-2 border-indigo-500"></div>
                        )}
                      </div>
                    ))}
                    </div>
                  </div>
                )}
            </div>
          )}
          {/* Review content */}
          <div className="p-6">
            {/* Content (brief summary) */}
            <div className="font-semibold text-lg mb-4">{review.content}</div>
            
            <div className="flex items-center space-x-1 mb-4">
              {renderRatingStars(review.rating)}
              <span className="ml-2 text-gray-400">({review.rating}/5)</span>
            </div>

            {/* Tags */}
            {review.tags && review.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {review.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-block bg-indigo-900 text-indigo-200 px-2 py-1 rounded text-sm"
                  >
                    <FaTag className="inline mr-1 text-xs" /> {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author and date info */}
            <div className="mt-8 pt-4 border-t border-gray-700 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center">
                {review.author?.imageUrl ? (
                  <img 
                    src={review.author.imageUrl && failedMediaUrls.has(getFullUrl(review.author.imageUrl)) ? 
                      generateAvatarDataUrl(review.author.name) : 
                      review.author.imageUrl ? getFullUrl(review.author.imageUrl) : generateAvatarDataUrl(review.author.name)} 
                    alt={review.author.name}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                    onError={(e) => {
                      e.preventDefault(); // Prevent default error behavior
                      
                      // Make sure we have a valid URL to work with
                      const profileUrl = review.author.imageUrl ? getFullUrl(review.author.imageUrl) : '';
                      
                      // Only log once and add to failed URLs set
                      if (profileUrl && !failedMediaUrls.has(profileUrl) && isMounted.current) {

                        // Use functional update to avoid stale state issues
                        setFailedMediaUrls(prevUrls => {
                          const newUrls = new Set(prevUrls);
                          newUrls.add(profileUrl);
                          return newUrls;
                        });
                      }
                      
                      // Immediately remove the error handler to prevent loops
                      if (e.currentTarget) {
                        e.currentTarget.onerror = null;
                        // Set the fallback avatar image
                        e.currentTarget.src = generateAvatarDataUrl(review.author.name);
                      }
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-700 text-white flex items-center justify-center mr-3">
                    <FaUser />
                  </div>
                )}
                <div>
                  <div className="font-medium">{review.author.name}</div>
                  {/* <div className="text-sm text-gray-400">{review.author.email}</div> */}
                </div>
              </div>
              
              <div className="text-gray-400 flex items-center">
                <FaCalendarAlt className="mr-2" />
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ReviewDetailPage;
