// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminNavbar from './components/AdminNavbar';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminReviews from './pages/AdminReviews';
import EditUser from './pages/EditUser';
import AdminLogin from './pages/AdminLogin'; 
import Footer from './components/Footer';

const App = () => {
  return (
    <Router>
      <AdminNavbar />
      <Routes>
        <Route path="/" element={<AdminLogin />} /> 
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/edit/:id" element={<EditUser />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        {/* <Route path="/admin/login" element={<AdminLogin />} /> */}
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;