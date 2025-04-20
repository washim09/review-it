// HomePage.tsx is the main page of the application. It displays the profile navbar, a call to action, and a list of featured reviews. It also contains a button to open the review form.

import { useEffect, useState } from 'react';
import ProfileNavbar from '../components/ProfileNavbar';
import FeaturedReviews from '../components/FeaturedReviews';
import ReviewForm from '../components/ReviewForm';
import HowItWorks from '../components/HowItWorks';
//import Footer from '../components/Footer';
import { FaPencilAlt, FaSearch } from 'react-icons/fa';

const HomePage = () => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [user, setUser] = useState<{ id: string | number } | null>(null);

  useEffect(() => {
    // Get user data from local storage
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <ProfileNavbar unreadCount={0}/>
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 to-purple-600/30"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Share Your Experience,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
                Help Others Decide
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto">
              Join our community of reviewers and help others make informed decisions
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => setShowReviewForm(true)}
                className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <FaPencilAlt className="mr-2" />
                Write a Review
              </button>
              
              <button className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-full hover:bg-white hover:text-indigo-600 transition-all duration-300">
                <FaSearch className="mr-2" />
                Explore Reviews
              </button>
            </div>
          </div>
        </div>

        {/* Wave effect */}
        {/* <div className="absolute bottom-0 w-full">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V0H1380C1320 0 1200 0 1080 0C960 0 840 0 720 0C600 0 480 0 360 0C240 0 120 0 60 0H0V120Z" fill="white"/>
          </svg>
        </div> */}
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50">
              <div className="text-4xl font-bold text-indigo-600 mb-2">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="text-4xl font-bold text-purple-600 mb-2">50K+</div>
              <div className="text-gray-600">Reviews Written</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-red-50">
              <div className="text-4xl font-bold text-pink-600 mb-2">100K+</div>
              <div className="text-gray-600">Monthly Visitors</div>
            </div>
          </div>
        </div>
      </div>

      <HowItWorks />
      <FeaturedReviews />
      
      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {user ? (
              <ReviewForm userId={user.id} onClose={() => setShowReviewForm(false)} />
            ) : (
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
                <p className="mb-6">You need to be logged in to submit a review.</p>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      
    </div>
  );
};

export default HomePage;