// Importing necessary libraries and components
//review-frontend/src/App.tsx
import { BrowserRouter as Router, Route, Routes, Outlet, Navigate } from 'react-router-dom';
import Footer from '../src/components/Footer';
import Login from '../src/pages/Login';
import Register from '../src/pages/Register';
import Home from '../src/pages/Home'; // Public home
import HomePage from './pages/HomePage'; // Authenticated user home
import UserProfile from './pages/UserProfile';
import ProtectedRoute from './components/ProtectedRoute';
import MessagePage from './components/MessagePage';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import { isAuthenticated } from './utils/authHelpers';
import Layout from './components/Layout'; // Import Layout component with polling

function App() {
  return (
    <Router>
      <AuthProvider> {/* Wrap the entire app with AuthProvider */}
        <Layout> {/* Layout component for global polling */}
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow pt-16">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                  <Route path="/home" element={<HomePage />} /> {/* Authenticated User Home */}
                  <Route path="/message" element={<MessagePage />} /> {/* Message page */}
                  <Route 
                    path="/profile" 
                    element={
                      isAuthenticated() ? 
                        <UserProfile /> : 
                        <Navigate to="/login" replace />
                    } 
                  />
                  <Route path="/user/profile" element={<Navigate to="/profile" replace />} />
                </Route>
              </Routes>
            </main>
            <Footer />
          </div>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;