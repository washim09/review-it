'use client';
import { useEffect, useState } from 'react';
import { fetchReviews, deleteReview } from '../services/adminService';
import { API_BASE_URL } from '../config/api';

interface Review {
  id: number;
  entity: string;
  rating: number;
  title: string;
  content: string;  // Brief summary
  review: string;   // Detailed review text
  category?: string;
  author: {
    name: string;
  };
  createdAt: string;
  tags: string[];
  imageUrl?: string;
  videoUrl?: string;
}

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const baseUrl = API_BASE_URL;
  
  // Function to parse JSON string or return the original string if it's not JSON
  const parseJsonStringOrReturn = (str: string | undefined): string[] => {
    if (!str) {
      return [];
    }


    try {
      if (str.startsWith('[') && str.endsWith(']')) {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : [str];
      }
    } catch {
      // Invalid JSON, return as single-item array
    }

    return [str];
  };
  
  // Get full URL for media
  const getFullUrl = (url: string): string => {
    if (!url) return '';


    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // For uploaded files, route through the static file API endpoint
    if (url.startsWith('/uploads/')) {
      return `${baseUrl}/api/staticfile${url}`;
    }

    return `${baseUrl}${url}`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Generate star rating display
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };
  
  // Get average rating
  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  useEffect(() => {
    const getReviews = async () => {
      try {
        const data = await fetchReviews();
        setReviews(data);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        alert('You are not authorized. Please log in.');
      } finally {
        setLoading(false);
      }
    };
    getReviews();
  }, []);

  const handleDeleteReview = async (reviewId: number) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview(reviewId);
        setReviews(reviews.filter((review) => review.id !== reviewId));
      } catch (error) {
        console.error('Failed to delete review:', error);
      }
    }
  };
  
  // Filter reviews based on search and rating
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = searchTerm === '' ||
      review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.review.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = filterRating === 'all' || review.rating.toString() === filterRating;
    
    return matchesSearch && matchesRating;
  });
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 pb-24">
        <div className="p-8">
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reviews Management</h1>
          <p className="text-gray-600">Manage and moderate all reviews submitted by users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Reviews</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{reviews.length}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{getAverageRating()}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">High Rated</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{reviews.filter(r => r.rating >= 4).length}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">With Media</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{reviews.filter(r => r.imageUrl || r.videoUrl).length}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by title, entity, author, or review content..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value as any)}
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{review.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">#{review.id} • {review.entity}</p>
                    {review.category && (
                      <p className="text-xs text-gray-500 mb-2">Category: {review.category}</p>
                    )}
                    <div className="flex items-center space-x-1 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600 ml-2">({review.rating}/5)</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {review.rating} ★
                    </span>
                  </div>
                </div>

                {/* Review Content */}
                <div className="mb-4">
                  <p className="text-gray-700 text-sm line-clamp-3">
                    {review.review || 'No detailed review provided.'}
                  </p>
                </div>

                {/* Author and Date */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {review.author.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-2">
                      <p className="text-sm font-medium text-gray-900">{review.author.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {review.tags && review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {review.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        {tag}
                      </span>
                    ))}
                    {review.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        +{review.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Media Preview */}
                <div className="flex space-x-2 mb-4">
                  {review.imageUrl && (
                    <div className="relative">
                      {(() => {
                        const imageUrls = parseJsonStringOrReturn(review.imageUrl);
                        const fullUrl = getFullUrl(imageUrls[0]);

                        return (
                          <img
                            src={fullUrl}
                            alt="Review image"
                            className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedReview(review)}
                            onError={(e) => {
                              // Use a simple data URL instead of external placeholder to avoid DNS issues
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                            }}
                          />
                        );
                      })()}
                      {parseJsonStringOrReturn(review.imageUrl).length > 1 && (
                        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded-full">
                          +{parseJsonStringOrReturn(review.imageUrl).length - 1}
                        </span>
                      )}
                    </div>
                  )}
                  {review.videoUrl && (
                    <div className="relative">
                      <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
                           onClick={() => setSelectedReview(review)}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a6 6 0 006 6v-1M9 10V9a6 6 0 016-6v1" />
                        </svg>
                      </div>
                      {parseJsonStringOrReturn(review.videoUrl).length > 1 && (
                        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded-full">
                          +{parseJsonStringOrReturn(review.videoUrl).length - 1}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedReview(review)}
                    className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No reviews found</div>
            <p className="text-gray-400 mt-2">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>

      {/* Review Details Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Review Details</h3>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <p className="text-gray-900 font-medium">{selectedReview.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Entity</label>
                    <p className="text-gray-900">{selectedReview.entity}</p>
                  </div>
                  {selectedReview.category && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <p className="text-gray-900">{selectedReview.category}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <div className="flex items-center">
                      {renderStars(selectedReview.rating)}
                      <span className="ml-2 text-gray-600">({selectedReview.rating}/5)</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                    <p className="text-gray-900">{selectedReview.author.name}</p>
                  </div>
                </div>

                {/* Review Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedReview.review || 'No detailed review provided.'}</p>
                  </div>
                </div>

                {/* Tags */}
                {selectedReview.tags && selectedReview.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedReview.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Media */}
                {(selectedReview.imageUrl || selectedReview.videoUrl) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Media</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedReview.imageUrl && parseJsonStringOrReturn(selectedReview.imageUrl).map((url, index) => {
                        const fullUrl = getFullUrl(url);

                        return (
                          <img
                            key={`img-${index}`}
                            src={fullUrl}
                            alt={`Review image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        );
                      })}
                      {selectedReview.videoUrl && parseJsonStringOrReturn(selectedReview.videoUrl).map((url, index) => {
                        const fullUrl = getFullUrl(url);

                        return (
                          <video
                            key={`vid-${index}`}
                            controls
                            className="w-full h-32 object-cover rounded-lg"
                          >
                            <source src={fullUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setSelectedReview(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDeleteReview(selectedReview.id);
                    setSelectedReview(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;