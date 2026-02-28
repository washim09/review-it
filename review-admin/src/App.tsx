// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminNavbar from './components/AdminNavbar';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminReviews from './pages/AdminReviews';
import AdminSupport from './pages/AdminSupport';
import AdminNewsletter from './pages/AdminNewsletter';
import EditUser from './pages/EditUser';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import Footer from './components/Footer';

const App = () => {
  return (
    <Router>
      <AdminNavbar />
      <Routes>
        {/* Auth routes */}
        <Route path="/" element={<AdminLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        
        {/* Admin panel routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/edit/:id" element={<EditUser />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/admin/support" element={<AdminSupport />} />
        <Route path="/admin/newsletter" element={<AdminNewsletter />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;