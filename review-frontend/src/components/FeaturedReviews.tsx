// // FeaturedReviews.tsx
// import { useEffect, useState } from 'react';
// import { fetchLatestReviews, Review } from '../services/reviewService';
// import { useNavigate } from 'react-router-dom';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Pagination } from 'swiper/modules';
// import 'swiper/css';
// import 'swiper/css/pagination';
// import { sendChatMessage } from '../services/chatService';
// import { useAuth } from '../context/AuthContext'; // Import useAuth hook
// import { logout } from '../services/authService';

// const FeaturedReviews = () => {
//   const { isAuth, currentUser } = useAuth(); // Use isAuth and currentUser from context
//   const navigate = useNavigate();
//   const [reviews, setReviews] = useState<Review[]>([]);
//   const [openMessageId, setOpenMessageId] = useState<number | null>(null);
//   const [messageContent, setMessageContent] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const baseUrl = 'http://localhost:3000';

//   // Debugging: Log currentUser and isAuth
//   console.log('Current User:', currentUser);
//   console.log('Is Authenticated:', isAuth);

//   // Fetch latest reviews
//   useEffect(() => {
//     const loadLatestReviews = async () => {
//       try {
//         const latestReviews = await fetchLatestReviews();
//         setReviews(latestReviews);
//       } catch (error) {
//         console.error('Failed to fetch latest reviews:', error);
//       }
//     };
//     loadLatestReviews();
//   }, []);

//   const handleSubmitMessage = async (reviewId: number) => {
//     if (!messageContent.trim()) {
//       setError('Message cannot be empty');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       if (!currentUser) {
//         throw new Error('You must be logged in to send messages');
//       }

//       // Debugging: Log the message being sent
//       console.log('Sending message:', {
//         reviewId,
//         senderId: currentUser.id,
//         content: messageContent,
//       });

//       // Send the message
//       await sendChatMessage({
//         reviewId,
//         senderId: currentUser.id,
//         content: messageContent,
//       });

//       // Clear the message input and close the message box
//       setOpenMessageId(null);
//       setMessageContent('');
//       console.log('Message submitted successfully'); // Debugging
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
//       setError(errorMessage);

//       // Redirect only for authentication errors
//       if (errorMessage.toLowerCase().includes('authentication') || 
//           errorMessage.toLowerCase().includes('session')) {
//         logout();
//         navigate('/login');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleMessageAction = (reviewId: number) => {
//     if (!isAuth) {
//       navigate('/login', { state: { from: window.location.pathname } });
//       return;
//     }
//     setOpenMessageId(reviewId);
//   };

//   return (
//     <div className="p-8 bg-gray-50 min-h-screen">
//       <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
//         Featured Reviews
//       </h2>
      
//       {error && (
//         <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
//           {error}
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {reviews.map((review) => (
//           <div
//             key={review.id}
//             className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
//           >
//             {/* Image/Video Slider */}
//             <div className="relative h-64">
//               <Swiper
//                 pagination={{
//                   clickable: true,
//                   el: '.swiper-pagination',
//                   bulletClass: 'swiper-pagination-bullet',
//                   bulletActiveClass: 'swiper-pagination-bullet-active',
//                 }}
//                 modules={[Pagination]}
//                 className="h-full"
//               >
//                 {review.imageUrl && (
//                   <SwiperSlide>
//                     <img
//                       src={`${baseUrl}${review.imageUrl}`}
//                       alt="Review"
//                       className="w-full h-64 object-cover"
//                     />
//                   </SwiperSlide>
//                 )}
//                 {review.videoUrl && (
//                   <SwiperSlide>
//                     <video controls className="w-full h-64 object-cover">
//                       <source src={`${baseUrl}${review.videoUrl}`} type="video/mp4" />
//                       Your browser does not support the video tag.
//                     </video>
//                   </SwiperSlide>
//                 )}
//               </Swiper>
//               <div className="swiper-pagination absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2" />
//                         onChange={(e) => setMessageContent(e.target.value)}
//                         className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         rows={3}
//                         placeholder="Type your message..."
//                         disabled={loading}
//                       />
//                       <div className="flex gap-2 justify-end">
//                         <button
//                           onClick={() => {
//                             setOpenMessageId(null);
//                             setMessageContent('');
//                           }}
//                           className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
//                           disabled={loading}
//                         >
//                           Close
//                         </button>
//                         <button
//                           type="button" // Ensure this is a button (not submit)
//                           onClick={() => handleSubmitMessage(review.id)}
//                           className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center"
//                           disabled={loading}
//                         >
//                           {loading && (
//                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                             </svg>
//                           )}
//                           {loading ? 'Sending...' : 'Submit'}
//                         </button>
//                       </div>
//                     </div>
//                   )
//                 ) : (
//                   <button
//                     onClick={() => navigate('/login')}
//                     className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors w-full"
//                   >
//                     Login to Send Message
//                   </button>
//                 )}
//               </div>

//               {/* Rest of the review content */}
//               <h3 className="text-xl font-semibold text-gray-800 mb-2">
//                 {review.entity}
//               </h3>
//               <div className="flex items-center mb-4">
//                 <span className="text-yellow-500 text-lg">
//                   {"★".repeat(review.rating)}
//                 </span>
//                 <span className="text-gray-400 text-lg">
//                   {"☆".repeat(5 - review.rating)}
//                 </span>
//               </div>
//               <p className="text-sm text-gray-600 mb-4">{review.content}</p>
//               <p className="text-sm text-gray-500 mb-2">
//                 By: <span className="font-semibold">{review.author.name}</span>
//               </p>
//               <div className="flex flex-wrap gap-2">
//                 {review.tags.map((tag, index) => (
//                   <span
//                     key={index}
//                     className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
//                   >
//                     {tag}
//                   </span>
//                 ))}
//               </div>
//               <p className="text-xs text-gray-400 mt-4">
//                 Reviewed on: {new Date(review.createdAt).toLocaleDateString()}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default FeaturedReviews;











import { useEffect, useState } from 'react';
import { fetchLatestReviews, Review } from '../services/reviewService';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import { FaStar, FaRegStar, FaPaperPlane, FaTimes } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/pagination';
import { sendChatMessage } from '../services/chatService';
import { logout } from '../services/authService';

const FeaturedReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [openMessageId, setOpenMessageId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const baseUrl = 'http://localhost:3000';

  // Check auth state
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    if (token && userData) {
      setIsAuth(true);
    }
  }, []);

  // Fetch latest reviews
  useEffect(() => {
    const loadLatestReviews = async () => {
      try {
        const latestReviews = await fetchLatestReviews();
        setReviews(latestReviews);
      } catch (error) {
        console.error('Failed to fetch latest reviews:', error);
      }
    };
    loadLatestReviews();
  }, []);

  const handleSubmitMessage = async (reviewId: number) => {
    if (!messageContent.trim()) {
      setError('Message cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userData = localStorage.getItem('userData');
      if (!userData) {
        throw new Error('You must be logged in to send messages');
      }

      // Send the message

      // Send the message
      await sendChatMessage({
        reviewId,
        content: messageContent,
      });

      // Clear the message input and close the message box
      setOpenMessageId(null);
      setMessageContent('');
      console.log('Message submitted successfully'); // Debugging
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);

      // Redirect only for authentication errors
      if (errorMessage.toLowerCase().includes('authentication') || 
          errorMessage.toLowerCase().includes('session')) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMessageAction = (reviewId: number) => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (!token || !userData) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    setOpenMessageId(reviewId);
  };

return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Reviews
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"></div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Image/Video Slider */}
              <div className="relative h-64">
                <Swiper
                  pagination={{
                    clickable: true,
                    dynamicBullets: true,
                  }}
                  navigation={true}
                  modules={[Pagination, Navigation]}
                  className="h-full rounded-t-2xl"
                >
                  {review.imageUrl && (
                    <SwiperSlide>
                      <img
                        src={`${baseUrl}${review.imageUrl}`}
                        alt="Review"
                        className="w-full h-64 object-cover"
                      />
                    </SwiperSlide>
                  )}
                  {review.videoUrl && (
                    <SwiperSlide>
                      <video controls className="w-full h-64 object-cover">
                        <source src={`${baseUrl}${review.videoUrl}`} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </SwiperSlide>
                  )}
                </Swiper>
              </div>

              {/* Review Content */}
              <div className="p-6">
                <div className="mb-6 border-b border-gray-100 pb-6">
                  {isAuth ? (
                    openMessageId !== review.id ? (
                      <button
                        onClick={() => handleMessageAction(review.id)}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                      >
                        <FaPaperPlane />
                        <span>Send Message</span>
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <textarea
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                          rows={3}
                          placeholder="Type your message..."
                          disabled={loading}
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setOpenMessageId(null);
                              setMessageContent('');
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            disabled={loading}
                          >
                            <FaTimes />
                          </button>
                          <button
                            onClick={() => handleSubmitMessage(review.id)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
                            disabled={loading}
                          >
                            {loading ? (
                              <span>Sending...</span>
                            ) : (
                              <>
                                <FaPaperPlane />
                                <span>Send</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  ) : (
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full bg-gray-100 text-gray-600 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Login to Send Message
                    </button>
                  )}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {review.entity}
                </h3>

                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, index) => (
                    index < review.rating ? (
                      <FaStar key={index} className="text-yellow-400" />
                    ) : (
                      <FaRegStar key={index} className="text-gray-300" />
                    )
                  ))}
                </div>

                <p className="text-gray-600 mb-4 line-clamp-3">{review.content}</p>

                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">
                    By <span className="font-semibold">{review.author.name}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {review.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedReviews;
