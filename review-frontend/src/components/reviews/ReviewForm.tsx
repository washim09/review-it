'use client'

import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useReviews } from '../../context/ReviewContext';
import { API_BASE_URL } from '../../config/api';

interface ReviewFormProps {
  onClose: () => void;
  onSubmit?: () => void;
}

const REVIEW_CATEGORIES = ["Electronics & Technology", "Food & Beverages", "Fashion & Apparel", "Health & Beauty", "Home & Garden", "Books & Media", "Sports & Outdoors", "Automotive", "Services", "Other"];

const ReviewForm = ({ onClose, onSubmit }: ReviewFormProps) => {
  // Get auth context and review context
  const { isAuth, user } = useAuth();
  const { refreshReviews } = useReviews();
  
  // State variables
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [videosPreviews, setVideosPreviews] = useState<string[]>([]);
  const [mediaError, setMediaError] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  
  // References to file input elements
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Check authentication when component mounts
  useEffect(() => {
    // Check if the user is authenticated but no token is present
    const storedToken = localStorage.getItem('authToken');
    if (!storedToken && isAuth) {
      setError('Authentication token not found. Please try logging out and logging back in.');
    }

  }, [isAuth, user]);
  
  // Handle image files selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setMediaError('');
    
    // Check if adding these files would exceed the limit
    if (images.length + files.length > 5) {
      setMediaError('You can upload a maximum of 5 images.');
      return;
    }
    
    // Process each file
    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setMediaError('One or more image files are too large. Maximum size is 5MB per image.');
        return;
      }
      
      // Add the file to the images array
      setImages(prev => [...prev, file]);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagesPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    
    // Clear the input value to allow selecting the same file again
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };
  
  // Handle video files selection
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setMediaError('');
    
    // Check if adding these files would exceed the limit
    if (videos.length + files.length > 5) {
      setMediaError('You can upload a maximum of 5 videos.');
      return;
    }
    
    // Process each file
    Array.from(files).forEach(file => {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setMediaError('One or more video files are too large. Maximum size is 50MB per video.');
        return;
      }
      
      // Add the file to the videos array
      setVideos(prev => [...prev, file]);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideosPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    
    // Clear the input value to allow selecting the same file again
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };
  
  // Remove specific image
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagesPreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  // Remove specific video
  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
    setVideosPreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  // Clear all images
  const clearAllImages = () => {
    setImages([]);
    setImagesPreviews([]);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };
  
  // Clear all videos
  const clearAllVideos = () => {
    setVideos([]);
    setVideosPreviews([]);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };
  
  // Handle adding a tag
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    // Don't add duplicate tags
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput('');
  };
  
  // Handle tag input keydown
  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!content.trim()) {
      setError('Review content is required');
      return;
    }
    
    if (isOtherCategory && !customCategory.trim()) {
      setError('Please enter a custom category or select a different category');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Get the current user object directly from localStorage
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
      if (!currentUser || !currentUser.id) {
        setError('User information not found. Please log out and log back in.');
        setLoading(false);
        return;
      }
      
      // Get the auth token
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      // Create a simple JSON object with the basic review data
      const reviewData = {
        title,
        entity: productName || title,
        productName: productName || '',
        category: isOtherCategory ? customCategory.trim() : (category || undefined),
        content,
        rating,
        tags
      };

      // Use the real endpoint that saves to the database
      const response = await axios.post(
        `${API_BASE_URL}/api/reviews`, // Real endpoint that saves to the database
        reviewData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Now that we have a successful review submission, let's handle media uploads
      if (response.data.success && response.data.review && (images.length > 0 || videos.length > 0)) {
        try {
          const reviewId = response.data.review.id;

          // Create form data for media upload
          const mediaFormData = new FormData();
          mediaFormData.append('reviewId', reviewId.toString());
          
          // Add all images if present
          images.forEach((image, _index) => {
            mediaFormData.append(`images`, image);
          });
          
          // Add all videos if present
          videos.forEach((video, _index) => {
            mediaFormData.append(`videos`, video);
          });
          
          // Upload the media
          await axios.post(
            `${API_BASE_URL}/api/reviews/media`,
            mediaFormData,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );

        } catch (mediaError) {
          console.error('Media upload error:', mediaError);
          // Continue even if media upload fails
          // The review itself was created successfully
        }
      }

      // Trigger refresh of reviews in any component using the context
      refreshReviews();
      
      // Show success message
      setSuccess(true);
      
      // Reset form
      setTitle('');
      setProductName('');
      setCategory('');
      setCustomCategory('');
      setIsOtherCategory(false);
      setContent('');
      setRating(5);
      setTags([]);
      clearAllImages();
      clearAllVideos();
      
      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit();
      }
      
      // Close modal if provided
      if (onClose) {
        setTimeout(() => onClose(), 2000);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
      console.error('Error submitting review:', error);
      
      // Handle different types of errors
      if (err.response) {
        // Server responded with an error status code
        const responseError = err.response.data?.error || err.response.data?.message || 'Failed to submit review';
        setError(`Error: ${responseError}`);
        console.error('Server response:', err.response.data);
      } else if (err.message?.includes('Network Error')) {
        // Specific handling for network errors
        setError('Network error: Unable to connect to the server. Please check your connection.');
        console.error('Network error:', err.message);
      } else {
        // Something else caused the error
        setError(`Error: ${err.message || 'An unknown error occurred'}`);
        console.error('Unknown error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black bg-opacity-70 overflow-y-auto" onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-[#1a2234] w-full max-w-md mx-auto my-8 relative p-5 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          ×
        </button>
        
        <div>
          <h2 className="text-xl font-medium text-white text-center mb-6">Write a Review</h2>
          
          {error && (
            <div className="text-red-400 text-sm text-center mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="text-green-400 text-sm text-center mb-4">
              Review submitted successfully!
            </div>
          )}
          
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-gray-300 text-sm mb-1">
                Review Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#21293d] border border-gray-700 rounded text-white placeholder-gray-500"
                placeholder="Enter review title"
                required
              />
            </div>
            
            {/* Product Name */}
            <div>
              <label htmlFor="productName" className="block text-gray-300 text-sm mb-1">
                Product Name
              </label>
              <input
                type="text"
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3 py-2 bg-[#21293d] border border-gray-700 rounded text-white placeholder-gray-500"
                placeholder="Enter product name (optional)"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-gray-300 text-sm mb-1">Category</label>
              {!isOtherCategory ? (
                <select id="category" value={category} onChange={(e) => { setCategory(e.target.value); if(e.target.value === 'Other') setIsOtherCategory(true); }} className="w-full px-3 py-2 bg-[#21293d] border border-gray-700 rounded text-white">
                <option value="">Select a category...</option>
                {REVIEW_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              ) : (
                <div className="flex gap-2">
                  <input type="text" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className="flex-1 px-3 py-2 bg-[#21293d] border border-gray-700 rounded text-white" placeholder="Enter custom category" maxLength={50} />
                  <button type="button" onClick={() => { setIsOtherCategory(false); setCategory(''); setCustomCategory(''); }} className="px-4 bg-gray-700 hover:bg-gray-600 text-white rounded">←</button>
                </div>
              )}
            </div>
            
            {/* Rating */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex bg-[#21293d] py-2 rounded justify-start pl-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-2xl focus:outline-none text-yellow-400"
                  >
                    {star <= rating ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>
          
            {/* Review Content */}
            <div>
              <label htmlFor="content" className="block text-gray-300 text-sm mb-1">
                Review Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 bg-[#21293d] border border-gray-700 rounded text-white placeholder-gray-500"
                placeholder="Write your review here"
                required
              ></textarea>
            </div>
        
            {/* Tags */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Tags
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="w-full px-3 py-2 bg-[#21293d] border border-gray-700 rounded text-white placeholder-gray-500"
                  placeholder="Add a tag and press Enter"
                  autoComplete="off"
                />
                {tagInput && (
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Add
                  </button>
                )}
              </div>
            
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center bg-indigo-600/30 text-blue-300 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-300 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Media */}
            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Media
              </label>
              
              <div className="flex flex-col space-y-2">
                {/* Image Upload Button */}
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full text-left py-2 px-3 bg-[#21293d] border border-gray-700 rounded text-gray-300"
                >
                  Add Image
                </button>
                
                {/* Video Upload Button */}
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full text-left py-2 px-3 bg-[#21293d] border border-gray-700 rounded text-gray-300"
                >
                  Add Video
                </button>
              </div>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                multiple
              />
              
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
                multiple
              />
              
              {/* Media Error */}
              {mediaError && (
                <div className="mt-2 text-red-500 text-sm">{mediaError}</div>
              )}
              
              {/* Media Counters */}
              <div className="flex justify-between mt-2 text-sm text-gray-400">
                <span>{images.length}/5 images</span>
                <span>{videos.length}/5 videos</span>
              </div>
              
              {/* Media Previews */}
              <div className="mt-2">
                {/* Image Previews */}
                {imagesPreviews.length > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-medium text-gray-300">Images</h4>
                      {images.length > 1 && (
                        <button 
                          type="button" 
                          onClick={clearAllImages}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove all
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {imagesPreviews.map((preview, index) => (
                        <div key={`image-${index}`} className="relative bg-[#21293d] rounded border border-gray-700 overflow-hidden">
                          <img 
                            src={preview} 
                            alt={`Image Preview ${index + 1}`} 
                            className="w-full h-32 object-contain" 
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Video Previews */}
                {videosPreviews.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-medium text-gray-300">Videos</h4>
                      {videos.length > 1 && (
                        <button 
                          type="button" 
                          onClick={clearAllVideos}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove all
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {videosPreviews.map((preview, index) => (
                        <div key={`video-${index}`} className="relative bg-[#21293d] rounded border border-gray-700 overflow-hidden">
                          <video 
                            src={preview} 
                            controls 
                            className="w-full h-32 object-contain" 
                          />
                          <button
                            type="button"
                            onClick={() => removeVideo(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                            title="Remove video"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
        
            {/* Submit Button */}
            <div className="mt-4">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded transition-colors text-center font-medium"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
