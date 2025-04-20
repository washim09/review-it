//This component is used to display user details in a popup.
//UserDetailsPopup.tsx
import { User } from '../services/userService';
import { FaInstagram, FaFacebook, FaTwitter, FaTimes } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

interface UserDetailsPopupProps {
  user: User;
  onClose: () => void;
}

const UserDetailsPopup = ({ user, onClose }: UserDetailsPopupProps) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
        <div className="relative p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              User Profile
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <FaTimes className="text-gray-500 text-xl" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MdEmail className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <MdPhone className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="text-gray-800">{user.contact || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Location</h3>
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <MdLocationOn className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-gray-800">{user.address || 'Address not provided'}</p>
                  <p className="text-gray-600">
                    {[user.city, user.state].filter(Boolean).join(', ') || 'Location not provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Social Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {user.instagram && (
                  <a
                    href={`https://instagram.com/${user.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 transition-colors"
                  >
                    <FaInstagram className="text-xl" />
                    <span>@{user.instagram}</span>
                  </a>
                )}
                {user.facebook && (
                  <a
                    href={`https://facebook.com/${user.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <FaFacebook className="text-xl" />
                    <span>{user.facebook}</span>
                  </a>
                )}
                {user.twitter && (
                  <a
                    href={`https://twitter.com/${user.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-400 transition-colors"
                  >
                    <FaTwitter className="text-xl" />
                    <span>@{user.twitter}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end">
            <button
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPopup;