import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">ProductReviews</h1>
        <ul className="flex space-x-6">
          <li>
            <Link to="/" className="text-gray-700 hover:text-gray-900">Home</Link>
          </li>
          <li>
            <Link to="/reviews" className="text-gray-700 hover:text-gray-900">Reviews</Link>
          </li>
          <li>
            <Link to="/login" className="text-gray-700 hover:text-gray-900">Login</Link>
          </li>
          <li>
            <Link to="/register" className="text-gray-700 hover:text-gray-900">Register</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
