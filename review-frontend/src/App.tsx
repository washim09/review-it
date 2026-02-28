//App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Footer from './components/layout/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home'; // Public home
import ReviewDetail from './pages/ReviewDetail';
import UserProfile from './pages/UserProfile';
import WriteReview from './pages/WriteReview';
import MessagePage from './components/messages/MessagePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';
import { ReviewProvider } from './context/ReviewContext'; // Import ReviewProvider
import AboutUs from './pages/AboutUs'; // Import About Us page
import Careers from './pages/Careers'; // Import Careers page
import Support from './pages/Support'; // Import Support page
import TermsOfService from './pages/TermsOfService'; // Import Terms of Service page
import PrivacyPolicy from './pages/PrivacyPolicy'; // Import Privacy Policy page
import CookiePolicy from './pages/CookiePolicy'; // Import Cookie Policy page
import ForgotPassword from './pages/ForgotPassword'; // Import Forgot Password page
import ResetPassword from './pages/ResetPassword'; // Import Reset Password page
import VerifyEmail from './pages/VerifyEmail'; // Import Email Verification page
import AuthCallback from './pages/AuthCallback'; // Import OAuth Callback page
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import DocumentTitleManager from './components/common/DocumentTitleManager'; // Import document title manager
import Offline from './pages/Offline'; // Import Offline page
import InstallPrompt from './components/pwa/InstallPrompt'; // Import PWA Install Prompt

function App() {
  return (
    <Router>
      <DocumentTitleManager /> {/* Handle dynamic document title updates */}
      <AuthProvider> {/* Wrap the entire app with AuthProvider */}
        <ReviewProvider> {/* Wrap the app with ReviewProvider */}
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/support" element={<Support />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/offline" element={<Offline />} /> {/* Offline fallback page */}

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                {/* Support both singular and plural routes for backward compatibility */}
                <Route path="/message" element={<MessagePage />} /> {/* Main messages page (singular) */}
                <Route path="/message/:contactId" element={<MessagePage />} /> {/* Individual conversation (singular) */}
                <Route path="/messages" element={<MessagePage />} /> {/* Main messages page (plural) */}
                <Route path="/messages/:contactId" element={<MessagePage />} /> {/* Individual conversation (plural) */}
                <Route path="/profile" element={<UserProfile />} /> {/* User Profile */}
                <Route path="/write-review" element={<WriteReview />} /> {/* Write Review - dedicated page */}
                <Route path="/review/:id" element={<ReviewDetail />} /> {/* Individual Review Detail */}
              </Route>
            </Routes>
            </main>
            <Footer />
            <ScrollToTop /> {/* Add ScrollToTop button */}
            <InstallPrompt /> {/* PWA Install Prompt */}
          </div>
        </ReviewProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;