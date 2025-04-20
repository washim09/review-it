// src/pages/EditUser.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUser, updateUser } from '../services/adminService';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: '',
    email: '',
    contact: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    instagram: '',
    facebook: '',
    twitter: '',
  });

  useEffect(() => {
    const getUser = async () => {
      try {
        const data = await fetchUser(Number(id));
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    getUser();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser(Number(id), user);
      navigate('/admin/users');
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Edit User</h1>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Include all input fields */}
        <div>
          <label htmlFor="name" className="block mb-1">Name</label>
          <input
            id="name"
            type="text"
            className="w-full p-2 border rounded"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block mb-1">Email</label>
          <input
            id="email"
            type="email"
            className="w-full p-2 border rounded"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="contact" className="block mb-1">Contact</label>
          <input
            id="contact"
            type="text"
            className="w-full p-2 border rounded"
            value={user.contact}
            onChange={(e) => setUser({ ...user, contact: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="gender" className="block mb-1">Gender</label>
          <select
            id="gender"
            className="w-full p-2 border rounded"
            value={user.gender}
            onChange={(e) => setUser({ ...user, gender: e.target.value })}
            required
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="address" className="block mb-1">Address</label>
          <input
            id="address"
            type="text"
            className="w-full p-2 border rounded"
            value={user.address}
            onChange={(e) => setUser({ ...user, address: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="city" className="block mb-1">City</label>
          <input
            id="city"
            type="text"
            className="w-full p-2 border rounded"
            value={user.city}
            onChange={(e) => setUser({ ...user, city: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="state" className="block mb-1">State</label>
          <input
            id="state"
            type="text"
            className="w-full p-2 border rounded"
            value={user.state}
            onChange={(e) => setUser({ ...user, state: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="instagram" className="block mb-1">Instagram</label>
          <input
            id="instagram"
            type="text"
            className="w-full p-2 border rounded"
            value={user.instagram}
            onChange={(e) => setUser({ ...user, instagram: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="facebook" className="block mb-1">Facebook</label>
          <input
            id="facebook"
            type="text"
            className="w-full p-2 border rounded"
            value={user.facebook}
            onChange={(e) => setUser({ ...user, facebook: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="twitter" className="block mb-1">Twitter</label>
          <input
            id="twitter"
            type="text"
            className="w-full p-2 border rounded"
            value={user.twitter}
            onChange={(e) => setUser({ ...user, twitter: e.target.value })}
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditUser;