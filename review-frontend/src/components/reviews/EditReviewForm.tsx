'use client'

import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaImage, FaTimes, FaStar, FaRegStar } from 'react-icons/fa';
import { getToken } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/api';

interface Review {
  id: string;
  title: string;
  content: string;
  review: string;
  rating: number;
  createdAt: string;
  productName: string;
  entity?: string;
  imageUrl?: string;
  videoUrl?: string;
  tags?: string[];
}

interface MediaItem {
  id?: string;
  url: string;
  type: 'image' | 'video';
  file?: File;
  isNew?: boolean;
  toDelete?: boolean;
}

interface EditReviewFormProps {
  review: Review | null;
  onClose: () => void;
  onSave: (updatedReview: Review) => void;
}

const EditReviewForm = ({ review, onClose, onSave }: EditReviewFormProps) => {
  useAuth();
  
  const [title, setTitle] = useState('');
  // Summary field removed
  const [reviewText, setReviewText] = useState(''); // Detailed review
  const [productName, setProductName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (review) {
      setTitle(review.title || '');
      setReviewText(review.review || ''); // Set detailed review
      setRating(review.rating);
      setProductName(review.productName || '');
      setTags(review.tags || []);

      const initialMedia: MediaItem[] = [];
      
      // Handle imageUrl - could be JSON string array or single URL
      if (review.imageUrl) {
        try {
          // Check if it's a JSON string array
          if (review.imageUrl.startsWith('[') && review.imageUrl.endsWith(']')) {
            const imageUrlsArray = JSON.parse(review.imageUrl);

            if (Array.isArray(imageUrlsArray)) {
              imageUrlsArray.forEach((url, index) => {
                if (typeof url === 'string') {
                  initialMedia.push({
                    id: `image-${review.id}-${index}`,
                    url: url,
                    type: 'image'
                  });
                }
              });
            }
          } else {
            // Handle as a single URL string (for backward compatibility)
            initialMedia.push({
              id: `image-${review.id}`,
              url: review.imageUrl,
              type: 'image'
            });
          }
        } catch (error) {
          console.error('Error processing image URL:', error);
          // Fallback to treating as a single URL
          initialMedia.push({
            id: `image-${review.id}`,
            url: review.imageUrl,
            type: 'image'
          });
        }
      }
      
      // Handle videoUrl - could be JSON string array or single URL
      if (review.videoUrl) {
        try {
          // Check if it's a JSON string array
          if (review.videoUrl.startsWith('[') && review.videoUrl.endsWith(']')) {
            const videoUrlsArray = JSON.parse(review.videoUrl);

            if (Array.isArray(videoUrlsArray)) {
              videoUrlsArray.forEach((url, index) => {
                if (typeof url === 'string') {
                  initialMedia.push({
                    id: `video-${review.id}-${index}`,
                    url: url,
                    type: 'video'
                  });
                }
              });
            }
          } else {
            // Handle as a single URL string (for backward compatibility)
            initialMedia.push({
              id: `video-${review.id}`,
              url: review.videoUrl,
              type: 'video'
            });
          }
        } catch (error) {
          console.error('Error processing video URL:', error);
          // Fallback to treating as a single URL
          initialMedia.push({
            id: `video-${review.id}`,
            url: review.videoUrl,
            type: 'video'
          });
        }
      }
      
      setMedia(initialMedia);
    }
  }, [review]);

  const handleAddMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newMediaItems = [...media];

    Array.from(files).forEach(file => {
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      
      if (type === 'image' && file.size > 5 * 1024 * 1024) {
        setError('Image file too large (max 5MB)');
        return;
      }
      
      if (type === 'video' && file.size > 50 * 1024 * 1024) {
        setError('Video file too large (max 50MB)');
        return;
      }
      
      const url = URL.createObjectURL(file);
      
      newMediaItems.push({
        url,
        type,
        file,
        isNew: true
      });
    });

    setMedia(newMediaItems);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveMedia = (index: number) => {
    const updatedMedia = [...media];
    
    if (updatedMedia[index].isNew) {
      updatedMedia.splice(index, 1);
    } else {
      updatedMedia[index] = {
        ...updatedMedia[index],
        toDelete: true
      };
    }
    
    setMedia(updatedMedia);
  };

  const handleRestoreMedia = (index: number) => {
    const updatedMedia = [...media];
    updatedMedia[index] = {
      ...updatedMedia[index],
      toDelete: false
    };
    setMedia(updatedMedia);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!review) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const token = getToken();
      
      // Step 1: Upload new media files
      const uploadedMediaUrls: { type: 'image' | 'video', url: string }[] = [];
      
      for (const item of media) {
        if (item.isNew && item.file) {
          // Upload new file
          const formData = new FormData();
          formData.append('file', item.file);
          
          try {
            const uploadResponse = await axios.post(
              `${API_BASE_URL}/api/upload`,
              formData,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data'
                }
              }
            );
            
            if (uploadResponse.data && uploadResponse.data.fileUrl) {
              uploadedMediaUrls.push({
                type: item.type,
                url: uploadResponse.data.fileUrl
              });
            }
          } catch (uploadError) {
            console.error('Error uploading file:', uploadError);
            setError('Failed to upload media files');
            setIsSubmitting(false);
            return;
          }
        } else if (!item.toDelete && !item.isNew) {
          // Keep existing media that wasn't deleted
          uploadedMediaUrls.push({
            type: item.type,
            url: item.url
          });
        }
      }
      
      // Step 2: Separate images and videos
      const imageUrls = uploadedMediaUrls
        .filter(m => m.type === 'image')
        .map(m => m.url);
      
      const videoUrls = uploadedMediaUrls
        .filter(m => m.type === 'video')
        .map(m => m.url);
      
      // Step 3: Prepare update data with media
      const updateData = {
        title: title.trim(),
        content: title.trim(),
        review: reviewText.trim(),
        rating,
        productName: productName.trim(),
        entity: productName.trim(),
        tags,
        imageUrl: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
        videoUrl: videoUrls.length > 0 ? JSON.stringify(videoUrls) : null
      };

      // Step 4: Send update request
      const response = await axios.put(
        `${API_BASE_URL}/api/reviews/${review.id}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setSuccess(true);
      onSave(response.data);
      
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
      
    } catch (error: unknown) {
      console.error('Error updating review:', error);
      setError('Failed to update review');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getFullUrl = (url: string) => {
    if (url.startsWith('blob:') || url.startsWith('http')) {
      return url;
    }
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg max-w-lg w-full mx-auto">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <FaTimes size={20} />
        </button>
        
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-center mb-6">Edit Review</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            {/* Product Name */}
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-2xl focus:outline-none"
                  >
                    {star <= rating ? (
                      <FaStar className="text-yellow-400" />
                    ) : (
                      <FaRegStar className="text-gray-300" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Summary field removed as requested */}
            
            {/* Detailed Review */}
            <div>
              <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">Detailed Review</label>
              <textarea
                id="review"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={6}
                placeholder="Write your detailed review here"
                required
              ></textarea>
            </div>
            
            {/* Tags */}
            <div>
              <label htmlFor="tagInput" className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex">
                <input
                  id="tagInput"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="w-full p-2 border border-gray-300 rounded-l-md"
                  placeholder="Add tags and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 bg-blue-500 text-white rounded-r-md"
                >
                  Add
                </button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 px-2 py-1 rounded-full text-sm flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-gray-500 hover:text-red-500"
                      >
                        <FaTimes size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Media</label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center py-2 px-4 w-full bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                <FaImage className="mr-2" /> Upload Image or Video
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleAddMedia}
                multiple
              />
              
              {media.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {media.map((item, index) => (
                    <div 
                      key={index} 
                      className={`relative rounded overflow-hidden ${item.toDelete ? 'opacity-50' : ''}`}
                    >
                      {item.type === 'image' ? (
                        <img
                          src={getFullUrl(item.url)}
                          alt={`Media ${index + 1}`}
                          className="w-full h-24 object-cover"
                        />
                      ) : (
                        <video
                          src={getFullUrl(item.url)}
                          className="w-full h-24 object-cover"
                          controls
                        />
                      )}
                      
                      {item.toDelete ? (
                        <button
                          type="button"
                          onClick={() => handleRestoreMedia(index)}
                          className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1 hover:bg-green-600 text-xs"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <FaTimes size={10} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Supported formats: JPG, PNG, GIF, MP4, WebM</p>
            </div>
            
            {/* Error display */}
            {error && (
              <div className="bg-red-50 p-2 rounded text-red-600 text-center text-sm">
                {error}
              </div>
            )}
            
            {/* Success message */}
            {success && (
              <div className="bg-green-50 p-2 rounded text-green-600 text-center text-sm">
                Review updated successfully!
              </div>
            )}
            
            {/* Submit button */}
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mx-2"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md mx-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Update Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditReviewForm;