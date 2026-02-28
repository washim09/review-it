'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../modals/AuthModal';
import axios from 'axios';
import { getMediaUrl } from '../../utils/mediaUtils';
import { Review } from '../../types';
import { API_BASE_URL } from '../../config/api';

const Banner = () => {
  const { isAuth } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [topReviews, setTopReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [loadingActiveUsers, setLoadingActiveUsers] = useState(true);

  const formatCompactPlus = (n: number) => {
    if (!Number.isFinite(n)) return '—';
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B+`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M+`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K+`;
    return `${n}+`;
  };

  const handleWriteReview = () => {
    if (isAuth) {
      router.push('/write-review');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleExploreReviews = () => {
    const featuredSection = document.getElementById('featured-reviews');
    if (featuredSection) {
      featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const fetchTopReviews = async () => {
      setLoadingReviews(true);
      setReviewError(null);
      
      try {
        const response = await axios.get(`${API_BASE_URL}/api/reviews/featured`, {
          params: { rating: 5, limit: 3 },
          timeout: 5000
        });

        const processedReviews = response.data.map((review: any) => {
          // Create a new review object to avoid mutations
          const processedReview = { ...review };
          
          // Process author image
          if (processedReview.author?.imageUrl) {
            processedReview.author.imageUrl = getMediaUrl(processedReview.author.imageUrl);
          } else if (processedReview.author) {
            processedReview.author.imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(processedReview.author.name || 'User')}&background=6D28D9&color=fff`;
          }
          
          // Process media from API (same logic as FeaturedReviews)
          const mediaUrlsFromBackend = Array.isArray(review.mediaUrls) ? review.mediaUrls : [];
          let processedMediaUrls: string[] = [];
          
          if (mediaUrlsFromBackend.length > 0) {
            // Process all URLs in mediaUrls array
            processedMediaUrls = mediaUrlsFromBackend
              .filter((url: any) => url && typeof url === 'string' && url.trim() !== '')
              .map((url: string) => getMediaUrl(url))
              .filter((url: string) => url && url !== '');
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
          
          // Convert to media array format for display component
          processedReview.media = processedMediaUrls;

          return processedReview;
        });

        setTopReviews(processedReviews);
      } catch (error) {
        setReviewError('Failed to load top reviews');
        setTopReviews([
          {
            id: 1,
            title: 'Amazing Product Experience',
            content: 'This has completely transformed how I approach my work. The interface is intuitive, and the features are exactly what I needed.',
            review: 'Detailed review with more information about the product experience.',
            rating: 5,
            createdAt: new Date().toISOString(),
            entity: 'Product',
            author: { 
              id: 1, 
              name: 'John D.', 
              email: 'john@example.com',
              imageUrl: '',
              createdAt: new Date().toISOString()
            },
            tags: [],
            authorId: 1,
            media: [
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
              { type: 'image', url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400' }
            ]
          }
        ]);
      } finally { setLoadingReviews(false); }
    };
    fetchTopReviews();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchActiveUsers = async () => {
      try {
        setLoadingActiveUsers(true);
        const res = await fetch(`${API_BASE_URL}/api/metrics/impact`);
        const json = await res.json();
        if (!cancelled && res.ok && json?.success && json?.data?.activeUsers !== undefined) {
          setActiveUsers(Number(json.data.activeUsers));
        }
      } catch {
        // Do not break UI if this metric fails
      } finally {
        if (!cancelled) setLoadingActiveUsers(false);
      }
    };

    fetchActiveUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative overflow-hidden py-24 px-4 bg-indigo-600 bg-gradient-to-br from-indigo-600 to-purple-700 -mt-[72px]">
          {/* Enhanced Background decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            {/* Flowing gradient animation */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 opacity-20 animate-flow bg-size-200"></div>
            
            {/* Animated decorative blobs */}
            <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-br from-indigo-300/40 to-purple-400/30 rounded-full filter blur-[80px] opacity-40 animate-wave"></div>
            <div className="absolute -bottom-32 right-10 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-indigo-400/20 rounded-full filter blur-[80px] opacity-40 animate-pulse-slow"></div>
            <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-purple-300/20 rounded-full filter blur-[70px] opacity-30 animate-float-slow animation-delay-1000"></div>
            
            {/* Wave-like SVG shapes */}
            <svg className="absolute top-10 right-10 w-32 h-32 text-white/50 animate-float z-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 14c1.5-1.5 3-2 4.5-1.5c1.5.5 2.5 1.5 3.5 2.5c1.5 1.5 3 2 4.5 1.5c1.5-.5 2.5-1.5 3.5-2.5"/>
              <path d="M2 8c1.5-1.5 3-2 4.5-1.5c1.5.5 2.5 1.5 3.5 2.5c1.5 1.5 3 2 4.5 1.5c1.5-.5 2.5-1.5 3.5-2.5"/>
            </svg>
            <svg className="absolute bottom-20 left-20 w-32 h-32 text-white/20 animate-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 14c1.5-1.5 3-2 4.5-1.5c1.5.5 2.5 1.5 3.5 2.5c1.5 1.5 3 2 4.5 1.5c1.5-.5 2.5-1.5 3.5-2.5"/>
              <path d="M2 8c1.5-1.5 3-2 4.5-1.5c1.5.5 2.5 1.5 3.5 2.5c1.5 1.5 3 2 4.5 1.5c1.5-.5 2.5-1.5 3.5-2.5"/>
            </svg>
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[url('/src/assets/images/grid-pattern.svg')] bg-center opacity-10"></div>
          </div>
          
          {/* Content */}
          <div className="container mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-16">
              <div className="md:w-1/2 text-center md:text-left">
                <div className="inline-block rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 text-white font-medium text-sm mb-5 shadow-md border border-white/10">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    Genuine Reviews Platform
                  </span>
                </div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight leading-tight"
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300 font-bold">Genuine</span>
                  <span className="text-white">, unsponsored reviews from </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300 font-bold">real users</span>
                  <span className="text-white">, with images and</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300 font-bold"> videos.</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-xl"
                >
                  Help others make informed decisions with your honest reviews
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="flex items-center mt-10 space-x-4"
                >
                  <div className="flex flex-col justify-center">
                    <div className="flex h-5 items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                    <div className="text-xs text-white mt-1">Trusted Reviews</div>
                  </div>
                  
                  <div className="h-8 border-l border-neutral-300"></div>
                  
                  <div className="flex flex-col justify-center">
                    <div className="font-semibold text-neutral-700 h-5 flex items-center">
                      {loadingActiveUsers ? '—' : formatCompactPlus(activeUsers ?? Number.NaN)}
                    </div>
                    <div className="text-xs text-white mt-1">Active Users</div>
                  </div>
                </motion.div>
              </div>
              
              <div className="md:w-1/2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="relative overflow-hidden mx-auto w-full max-w-md h-[420px]"
                >
                  <div className="card-highlight rounded-2xl shadow-xl p-1 relative">
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-conic from-primary-500 via-secondary-500 to-accent-500 rounded-full blur-xl opacity-50"></div>
                    <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-conic from-primary-500 via-accent-500 to-secondary-500 rounded-full blur-xl opacity-50"></div>
                    
                    <div className="bg-white relative rounded-xl overflow-hidden p-6 h-[400px] flex flex-col">
                      {loadingReviews ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin mb-4"></div>
                        </div>
                      ) : reviewError ? (
                        <div className="text-center py-6">
                          <div className="text-red-500 mb-2">
                            <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-neutral-600 mb-3">{reviewError}</p>
                          <p className="text-neutral-500 text-sm">Showing fallback content instead</p>
                        </div>
                      ) : topReviews.length > 0 ? (
                        <>
                          <div className="flex items-center mb-4">
                            {/* Author information is logged in useEffect */}
  
                            {/* Always attempt to render the image first with explicit fallbacks */}
                            <img 
                              src={topReviews[0]?.author?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(topReviews[0]?.author?.name || 'User')}&background=6D28D9&color=fff`}
                              alt={`${topReviews[0]?.author?.name || 'User'}'s profile`}
                              className="h-10 w-10 rounded-full object-cover mr-3 shadow-md"
                              onError={(e) => {
  
                                const target = e.target as HTMLImageElement;
                                target.onerror = null; // Prevent infinite onError loops
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(topReviews[0]?.author?.name || 'User')}&background=6D28D9&color=fff`;
                              }}
                            />
                            <div>
                              <h4 className="font-semibold text-neutral-900">{topReviews[0]?.author?.name || 'User'}</h4>
                              <div className="flex items-center">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg key={star} className={`w-4 h-4 ${star <= (topReviews[0]?.rating || 5) ? 'text-secondary-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                    </svg>
                                  ))}
                                </div>
                                <span className="text-xs ml-1 text-neutral-500">
                                  {topReviews[0]?.createdAt ? new Date(topReviews[0].createdAt).toLocaleDateString() : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-2 flex-1 overflow-hidden">
                            <h3 className="text-base font-semibold text-neutral-900 mb-1 line-clamp-1">{topReviews[0]?.title || 'Amazing Product Experience'}</h3>
                            <p className="text-neutral-600 mb-2 text-sm leading-snug line-clamp-2">
                              {topReviews[0]?.content || topReviews[0]?.review || 'This product exceeded all my expectations. The quality is outstanding and customer service was excellent. Would highly recommend to everyone!'}
                            </p>
                            
                            {/* Media Content Display */}
                            {(() => {
                              const hasMedia = Array.isArray(topReviews[0]?.media) && topReviews[0].media.length > 0;
                              return hasMedia;
                            })() && (
                              <div className="mb-2">
                                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                                  {topReviews[0].media!.slice(0, 3).map((mediaItem: any, index: number) => (
                                    <div key={index} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-neutral-100">
                                      {mediaItem.type === 'image' || mediaItem.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                        <img 
                                          src={mediaItem.url || mediaItem} 
                                          alt={`Review media ${index + 1}`}
                                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                          }}
                                        />
                                      ) : mediaItem.type === 'video' || mediaItem.url?.match(/\.(mp4|webm|ogg)$/i) ? (
                                        <div className="relative w-full h-full bg-neutral-900 flex items-center justify-center">
                                          <div className="absolute inset-0 bg-black/40"></div>
                                          <svg className="w-8 h-8 text-white z-10" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                          </svg>
                                          {mediaItem.thumbnail && (
                                            <img 
                                              src={mediaItem.thumbnail}
                                              alt={`Video thumbnail ${index + 1}`}
                                              className="absolute inset-0 w-full h-full object-cover"
                                            />
                                          )}
                                        </div>
                                      ) : (
                                        <img 
                                          src={typeof mediaItem === 'string' ? mediaItem : mediaItem.url} 
                                          alt={`Review media ${index + 1}`}
                                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                          }}
                                        />
                                      )}
                                    </div>
                                  ))}
                                  {topReviews[0].media!.length > 3 && (
                                    <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-neutral-200 flex items-center justify-center">
                                      <span className="text-neutral-600 text-sm font-medium">+{topReviews[0].media!.length - 3}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex space-x-2">
                              {topReviews[0]?.entity && (
                                <span className="badge-primary badge-sm">{topReviews[0].entity}</span>
                              )}
                              {topReviews[0]?.tags && topReviews[0].tags.length > 0 && (
                                <span className="badge-secondary badge-sm">{topReviews[0].tags[0]}</span>
                              )}
                            </div>
                            <div className="flex space-x-3 text-neutral-500">
                              <button className="hover:text-primary-500 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
                                </svg>
                              </button>
                              <button className="hover:text-primary-500 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-10">
                          <p className="text-neutral-600">No reviews available</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Top-right floating review - Show second review if available */}
                  {topReviews.length > 1 && (
                    <div className="absolute top-[25%] -right-8 sm:right-0 transform rotate-6 z-10">
                      <motion.div 
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="bg-white p-4 rounded-xl shadow-lg max-w-[200px]"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          {topReviews[1]?.author?.imageUrl ? (
                            <img 
                              src={topReviews[1].author.imageUrl} 
                              alt={`${topReviews[1].author.name}'s profile`}
                              className="h-8 w-8 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(topReviews[1]?.author?.name || 'User')}&background=6D28D9&color=fff`;
                              }}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-success-500 flex items-center justify-center text-white font-bold text-sm">
                              {topReviews[1]?.author?.name.charAt(0) || 'S'}
                            </div>
                          )}
                          {topReviews[1]?.entity && (
                            <span className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-700 font-medium">
                              {topReviews[1].entity}
                            </span>
                          )}
                        </div>
                        <div className="flex text-warning-500 mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className={`w-3 h-3 ${star <= (topReviews[1]?.rating || 5) ? 'text-warning-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                          ))}
                        </div>
                        <p className="text-xs text-neutral-600 mb-2 line-clamp-2">{topReviews[1]?.content || topReviews[1]?.review || 'Great customer service!'}</p>
                        {Array.isArray(topReviews[1]?.media) && topReviews[1].media.length > 0 && (
                          <div className="flex gap-1 overflow-hidden">
                            {topReviews[1].media.slice(0, 3).map((mediaItem: any, index: number) => (
                              <div key={index} className="relative flex-shrink-0 w-14 h-14 rounded-md overflow-hidden bg-neutral-100">
                                <img 
                                  src={mediaItem} 
                                  alt={`Media ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </div>
                  )}
                  
                  {/* Bottom-left floating review - Show third review if available */}
                  {topReviews.length > 2 && (
                    <div className="absolute bottom-5 -left-8 sm:left-4 transform -rotate-3 z-10">
                      <motion.div 
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="bg-white p-4 rounded-xl shadow-lg max-w-[200px]"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          {topReviews[2]?.author?.imageUrl ? (
                            <img 
                              src={topReviews[2].author.imageUrl} 
                              alt={`${topReviews[2].author.name}'s profile`}
                              className="h-8 w-8 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(topReviews[2]?.author?.name || 'User')}&background=6D28D9&color=fff`;
                              }}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-secondary-500 flex items-center justify-center text-white font-bold text-sm">
                              {topReviews[2]?.author?.name.charAt(0) || 'M'}
                            </div>
                          )}
                          <span className="text-sm font-medium">{topReviews[2]?.author?.name || 'User'}</span>
                        </div>
                        <div className="flex text-warning-500 mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className={`w-3 h-3 ${star <= (topReviews[2]?.rating || 4) ? 'text-warning-500' : 'text-neutral-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                          ))}
                        </div>
                        <p className="text-xs text-neutral-600 mb-2 line-clamp-2">{topReviews[2]?.content || topReviews[2]?.review || 'Solid product, would recommend!'}</p>
                        {Array.isArray(topReviews[2]?.media) && topReviews[2].media.length > 0 && (
                          <div className="flex gap-1 overflow-hidden">
                            {topReviews[2].media.slice(0, 3).map((mediaItem: any, index: number) => (
                              <div key={index} className="relative flex-shrink-0 w-14 h-14 rounded-md overflow-hidden bg-neutral-100">
                                <img 
                                  src={mediaItem} 
                                  alt={`Media ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
            
            {/* Action Buttons - Centered below content */}
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4 mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <button
                onClick={handleWriteReview}
                className="relative text-white font-medium rounded-xl text-sm px-5 py-2.5 transition-all duration-300 focus:outline-none active:scale-95 shadow-wave overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                <span className="relative flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Write a Review
                </span>
              </button>
              <button
                onClick={handleExploreReviews}
                className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-medium rounded-xl text-sm px-5 py-2.5 transition-all duration-300 border border-white/20 focus:outline-none active:scale-95"
              >
                Explore Reviews
              </button>
            </motion.div>
          </div>
          
          {/* Large Wave Background Design */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0">
            <svg className="relative block w-full h-24 sm:h-32 md:h-40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0 C150,60 350,60 600,30 C850,0 1050,0 1200,30 L1200,120 L0,120 Z" className="fill-indigo-500/30"></path>
              <path d="M0,20 C200,80 400,80 600,50 C800,20 1000,20 1200,50 L1200,120 L0,120 Z" className="fill-purple-500/20"></path>
              <path d="M0,40 C250,100 450,100 600,70 C750,40 950,40 1200,70 L1200,120 L0,120 Z" className="fill-white/10"></path>
            </svg>
          </div>
          
          {/* Authentication Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
        </div>

        
    );
};

export default Banner;