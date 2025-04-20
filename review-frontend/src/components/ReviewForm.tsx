// Define the ReviewForm component
//ReviewForm.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitReview } from '../services/reviewService';

// Define the props interface
interface ReviewFormProps {
  onClose: () => void; // Function to close the form
  userId?: string | number; // Optional user ID (can be string or number)
}

const ReviewForm = ({ onClose, userId }: ReviewFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    entity: '',
    rating: 0,
    title: '',
    content: '',
    review: '',
    tags: '',
    image: null as File | null,
    video: null as File | null,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const formPayload = new FormData();
      formPayload.append('entity', formData.entity);
      formPayload.append('rating', formData.rating.toString());
      formPayload.append('title', formData.title);
      formPayload.append('content', formData.content);
      formPayload.append('review', formData.review);
      formPayload.append('tags', formData.tags);
  
      // Get the target user ID from props or local storage
      const targetUserId = userId || (() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          return user.id;
        }
        return null;
      })();

      if (!targetUserId) {
        throw new Error('Please log in to submit a review');
      }

      // Add targetId for the user being reviewed
      formPayload.append('targetId', targetUserId.toString());
  
      if (formData.image) formPayload.append('image', formData.image);
      if (formData.video) formPayload.append('video', formData.video);
  
      await submitReview(formPayload);
      onClose(); // Close the form after submission
      navigate('/profile'); // Redirect to reviews page
    } catch (error) {
      console.error('Review submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'image' && e.target.files?.[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
    if (e.target.name === 'video' && e.target.files?.[0]) {
      setFormData({ ...formData, video: e.target.files[0] });
    }
  };

  return (
    <div className="bg-blue-300 p-6 rounded-lg shadow-md w-full max-w-2xl relative">
      {/* Close Icon */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-red-600 hover:text-red-800 text-2xl"
        aria-label="Close"
      >
        &times; {/* HTML entity for "X" */}
      </button>

      <h2 className="text-2xl font-bold mb-6">Write a Review</h2>
      <div className="max-h-[70vh] overflow-y-auto pr-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Entity (Product/Service Name) */}
          <div>
            <label className="block text-sm font-medium mb-1">Product/Service Name *</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded-md"
              value={formData.entity}
              onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-1">Rating *</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className={`text-2xl ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Review Title *</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded-md"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Main Review Content */}
          <div>
            <label className="block text-sm font-medium mb-1">Detailed Review *</label>
            <textarea
              required
              rows={4}
              className="w-full p-2 border rounded-md"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          {/* Additional Review Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Additional Notes</label>
            <textarea
              rows={2}
              className="w-full p-2 border rounded-md"
              value={formData.review}
              onChange={(e) => setFormData({ ...formData, review: e.target.value })}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., electronics, durable, affordable"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Upload Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Upload Video</label>
            <input
              type="file"
              name="video"
              accept="video/*"
              onChange={handleFileChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 px-4 rounded-md text-white ${
                loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;