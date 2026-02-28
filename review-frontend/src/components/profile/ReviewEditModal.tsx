'use client'

import { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaTimes, FaUpload, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { getToken } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/api';

// Define types
interface Review {
  id: string;
  title: string;
  content: string;  // Brief summary
  review: string;   // Detailed review text (required to match other components)
  rating: number;
  createdAt: string;
  productName: string;
  entity?: string;  // Added to match UserProfileReviews interface
  imageUrl?: string;
  videoUrl?: string;
  tags?: string[];
  mediaUrls?: string[];
  mediaTypes?: ('image' | 'video')[];
}

interface MediaItem {
  id?: string; // Unique identifier for the media item
  url: string;
  type: 'image' | 'video';
  file?: File;
  isNew?: boolean; // Flag to identify newly added media
  toDelete?: boolean; // Flag to identify media marked for deletion
}

interface ReviewEditModalProps {
  isOpen: boolean;
  review: Review | null;
  onClose: () => void;
  onSave: (updatedReview: Review) => void;
}

const ReviewEditModal: React.FC<ReviewEditModalProps> = ({ isOpen, review, onClose, onSave }) => {
  // State for form values
  const [title, setTitle] = useState('');
  // Summary field removed
  const [reviewText, setReviewText] = useState(''); // Detailed review text
  const [rating, setRating] = useState(0);
  const [productName, setProductName] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [deletedMediaUrls, setDeletedMediaUrls] = useState<string[]>([]);
  const [deletingMediaIds, setDeletingMediaIds] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Initialize form with review data when a review is provided
  useEffect(() => {
    if (review) {
      setTitle(review.title);
      setReviewText(review.review || '');
      setRating(review.rating);
      
      // Use productName first, fall back to entity if productName is not available
      setProductName(review.productName || review.entity || '');

      setTags(review.tags || []);
      setDeletedMediaUrls([]);
      setDeletingMediaIds({});

      // Initialize media array from review's media
      const initialMedia: MediaItem[] = [];
      
      // Process imageUrl - could be JSON string array or single URL
      if (review.imageUrl) {
        try {
          // Check if it's a JSON string array
          if (review.imageUrl.startsWith('[') && review.imageUrl.endsWith(']')) {
            const imageUrlsArray = JSON.parse(review.imageUrl);

            if (Array.isArray(imageUrlsArray)) {
              imageUrlsArray.forEach((url, index) => {
                if (typeof url === 'string') {
                  initialMedia.push({
                    id: `existing-image-${review.id}-${index}`,
                    url: url,
                    type: 'image'
                  });
                }
              });
            }
          } else {
            // Handle as a single URL string (for backward compatibility)
            initialMedia.push({
              id: `existing-image-${review.id}`,
              url: review.imageUrl,
              type: 'image'
            });
          }
        } catch (error) {
          console.error('Error processing image URL:', error);
          // Fallback to treating as a single URL
          initialMedia.push({
            id: `existing-image-${review.id}`,
            url: review.imageUrl,
            type: 'image'
          });
        }
      }
      
      // Process videoUrl - could be JSON string array or single URL
      if (review.videoUrl) {
        try {
          // Check if it's a JSON string array
          if (review.videoUrl.startsWith('[') && review.videoUrl.endsWith(']')) {
            const videoUrlsArray = JSON.parse(review.videoUrl);

            if (Array.isArray(videoUrlsArray)) {
              videoUrlsArray.forEach((url, index) => {
                if (typeof url === 'string') {
                  initialMedia.push({
                    id: `existing-video-${review.id}-${index}`,
                    url: url,
                    type: 'video'
                  });
                }
              });
            }
          } else {
            // Handle as a single URL string (for backward compatibility)
            initialMedia.push({
              id: `existing-video-${review.id}`,
              url: review.videoUrl,
              type: 'video'
            });
          }
        } catch (error) {
          console.error('Error processing video URL:', error);
          // Fallback to treating as a single URL
          initialMedia.push({
            id: `existing-video-${review.id}`,
            url: review.videoUrl,
            type: 'video'
          });
        }
      }
      
      // If review has mediaUrls array, use that instead (more comprehensive)
      if (review.mediaUrls && review.mediaTypes) {
  const mediaItems = review.mediaUrls.map((url, index) => ({
    id: `existing-media-${review.id}-${index}`,
    url,
    type: review.mediaTypes?.[index] || 'image',
    isNew: false,
  }));
  setMedia(mediaItems);
} else {
  setMedia(initialMedia);
}
    }
  }, [review]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle adding a new tag
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle keydown for tag input (add tag on Enter)
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Handle adding new media
  const handleAddMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Create a copy of the current media array
    const newMediaItems: MediaItem[] = [...media];

    // Process each selected file
    Array.from(files).forEach(file => {
      // Determine if it's an image or video based on MIME type
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      
      // Create object URL for preview
      const url = URL.createObjectURL(file);
      
      // Add to media array with a unique ID
      newMediaItems.push({
        id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate a unique ID
        url,
        type,
        file,
        isNew: true
      });
    });

    setMedia(newMediaItems);
    
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  // Handle removing media
  const handleRemoveMedia = async (index: number) => {
  const item = media[index];
  if (!item) return;

  const ok = window.confirm('Remove this media?');
  if (!ok) return;

  const itemId = item.id || `${item.url}-${index}`;
  setDeletingMediaIds(prev => ({ ...prev, [itemId]: true }));

  try {
    setMedia(prev => prev.filter((_, i) => i !== index));

    if (!item.isNew) {
      setDeletedMediaUrls(prev => (prev.includes(item.url) ? prev : [...prev, item.url]));
    }
  } finally {
    setDeletingMediaIds(prev => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }
};

  // Handle submitting the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let previousMedia: MediaItem[] = [];
    
    try {
      if (!review) {
        setError('No review to edit');
        setIsSubmitting(false);
        return;
      }
      
      // Log the data we're going to submit

      // Get token for authorization
      const token = getToken();
      
      // Create the update data (summary field removed)
      const productNameTrimmed = productName.trim();
      
      const updateData = {
        title: title.trim(),
        content: reviewText.trim(),     // Using reviewText as content to preserve review content
        review: reviewText.trim(),      // Detailed review text
        rating,
        productName: productNameTrimmed, // Store trimmed product name
        entity: productNameTrimmed,      // IMPORTANT: Ensure entity field matches productName
        tags: tags.length > 0 ? tags : []
      };

      previousMedia = media;

const uploadedOrKept: { url: string; type: 'image' | 'video' }[] = [];

for (const item of media) {
  if (item.isNew && item.file) {
    const formData = new FormData();
    formData.append('file', item.file);

    const uploadRes = await axios.post(
      `${API_BASE_URL}/api/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const uploadedUrl = uploadRes.data?.url; // backend returns { url }
    if (!uploadedUrl) {
      throw new Error('Upload failed: missing url');
    }

    uploadedOrKept.push({ url: uploadedUrl, type: item.type });
  } else {
    uploadedOrKept.push({ url: item.url, type: item.type });
  }
}

const mediaUrls = uploadedOrKept.map(m => m.url);
const mediaTypes = uploadedOrKept.map(m => m.type);

      // Send the update request
      const response = await axios.put(
  `${API_BASE_URL}/api/reviews/${review.id}`,
  {
    ...updateData,
    mediaUrls,
    mediaTypes,
    deletedMediaUrls,
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }
);

      // Create complete updated review with all fields
      // const updatedReview = {
      //   ...review,
      //   ...updateData,
      //   // Ensure these critical fields are explicitly set and not overwritten
      //   entity: productNameTrimmed,       // Explicitly set entity to match productName
      //   productName: productNameTrimmed,  // Explicitly set productName
      //   imageUrl: review.imageUrl,
      //   videoUrl: review.videoUrl
      // };

      // Call the onSave callback with the updated review
      onSave(response.data);
      setError('');
      onClose();
      
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string }; status?: number }; message?: string };
      console.error('Error updating review:', err);
      setMedia(previousMedia);
      
      // More detailed error information for debugging
      if (error.response) {
        console.error('Response error data:', error.response.data);
        
        // Show more specific error message to the user
        if (error.response.status === 401 || error.response.status === 403) {
          setError('Authentication error. Please log in again.');
        } else if (error.response.status === 404) {
          setError('Review not found. It may have been deleted.');
        } else {
          setError(`Failed to update review: ${error.response.data?.message || 'Unknown server error'}`);
        }
      } else if (error.message) {
        setError(`Failed to update review: ${error.message}`);
      } else {
        setError('Failed to update review: Unknown error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-70 transition-opacity" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-neutral-800 border border-neutral-600 rounded-lg shadow-xl max-w-3xl w-full p-6 overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-100 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
          
          <h2 className="text-2xl font-bold text-purple-300 mb-6">Edit Review</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            
            {/* Summary field removed as requested */}
              
            {/* Detailed Review Text */}
            <div>
              <label htmlFor="reviewText" className="block text-sm font-medium text-gray-300 mb-1">
                Detailed Review
              </label>
              <textarea
                id="reviewText"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={5}
                placeholder="Write your detailed review here"
                required
              ></textarea>
            </div>
            
            {/* Product Name */}
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-300 mb-1">
                Product Name
              </label>
              <input
                type="text"
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rating
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    {star <= rating ? (
                      <FaStar className="text-yellow-400 text-2xl" />
                    ) : (
                      <FaRegStar className="text-gray-400 text-2xl" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-1">
                Tags
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-grow bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="ml-2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-500 transition-colors"
                >
                  Add
                </button>
              </div>
              
              {/* Display tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-900/40 text-blue-300 text-xs font-medium px-2.5 py-1.5 rounded-full border border-blue-800/50 flex items-center"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-300 hover:text-blue-100"
                      >
                        <FaTimes />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Media
              </label>
              
              {/* File input */}
              <div className="flex items-center mb-4">
                <label className="flex items-center justify-center w-full bg-neutral-700 border border-neutral-600 border-dashed rounded-md py-3 px-4 cursor-pointer hover:bg-neutral-600 transition-colors">
                  <FaUpload className="text-indigo-400 mr-2" />
                  <span className="text-gray-300">Upload Image or Video</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleAddMedia}
                    multiple
                  />
                </label>
              </div>
              
              {/* Media preview */}
              {media.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {media.map((item, index) => (
                    <div 
                      key={index} 
                      className="relative rounded-md overflow-hidden border border-neutral-600"
                    >
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={`Media ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <video
                          src={item.url}
                          className="w-full h-32 object-cover"
                          controls
                        />
                      )}
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(index)}
                        disabled={!!deletingMediaIds[(item.id || `${item.url}-${index}`)] || isSubmitting}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        title="Remove"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Error message */}
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            {/* Form actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-600 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-500 transition-colors flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewEditModal;
