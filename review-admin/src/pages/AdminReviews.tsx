import { useEffect, useState } from 'react';
import { fetchReviews, deleteReview } from '../services/adminService';

interface Review {
  id: number;
  entity: string;
  rating: number;
  title: string;
  content: string;
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
  const baseUrl = 'http://localhost:3000'; // Replace with your backend URL

  useEffect(() => {
    const getReviews = async () => {
      try {
        const data = await fetchReviews();
        setReviews(data);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        // Show an error message or redirect to login
        alert('You are not authorized. Please log in.'); // Or use a toast notification
      }
    };
    getReviews();
  }, []);

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await deleteReview(reviewId);
      setReviews(reviews.filter((review) => review.id !== reviewId));
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Reviews</h1>
      <table className="mt-4 w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Entity</th>
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Rating</th>
            <th className="p-2 border">Content</th>
            <th className="p-2 border">Author</th>
            <th className="p-2 border">Tags</th>
            <th className="p-2 border">Image</th>
            <th className="p-2 border">Video</th>
            <th className="p-2 border">Created At</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id} className="border">
              <td className="p-2 border">{review.id}</td>
              <td className="p-2 border">{review.entity}</td>
              <td className="p-2 border">{review.title}</td>
              <td className="p-2 border">{'★'.repeat(review.rating)}</td>
              <td className="p-2 border">{review.content}</td>
              <td className="p-2 border">{review.author.name}</td>
              <td className="p-2 border">{review.tags.join(', ')}</td>
              <td className="p-2 border">
                {review.imageUrl ? (
                  <img
                    src={`${baseUrl}${review.imageUrl}`} // Full URL for image
                    alt="Review"
                    className="w-16 h-16 object-cover"
                  />
                ) : (
                  'No Image'
                )}
              </td>
              <td className="p-2 border">
                {review.videoUrl ? (
                  <video controls className="w-32 h-16 object-cover">
                    <source src={`${baseUrl}${review.videoUrl}`} type="video/mp4" /> {/* Full URL for video */}
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  'No Video'
                )}
              </td>
              <td className="p-2 border">{new Date(review.createdAt).toLocaleDateString()}</td>
              <td className="p-2 border">
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteReview(review.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminReviews;