// src/pages/AdminUsers.tsx
import { useEffect, useState } from 'react';
import { fetchUsers, deleteUser } from '../services/adminService';
import { Link } from 'react-router-dom';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await fetchUsers();
        if (data.length === 0) {
          console.log('No users found or token missing');
        }
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    getUsers();
  }, []);

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId);
      setUsers(users.filter((user: any) => user.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Users</h1>
      <table className="mt-4 w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Contact</th>
            <th className="p-2 border">Gender</th>
            <th className="p-2 border">Address</th>
            <th className="p-2 border">City</th>
            <th className="p-2 border">State</th>
            <th className="p-2 border">Instagram</th>
            <th className="p-2 border">Facebook</th>
            <th className="p-2 border">Twitter</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user.id} className="border">
              <td className="p-2 border">{user.id}</td>
              <td className="p-2 border">{user.name}</td>
              <td className="p-2 border">{user.email}</td>
              <td className="p-2 border">{user.contact || '-'}</td>
              <td className="p-2 border">{user.gender || '-'}</td>
              <td className="p-2 border">{user.address || '-'}</td>
              <td className="p-2 border">{user.city || '-'}</td>
              <td className="p-2 border">{user.state || '-'}</td>
              <td className="p-2 border">{user.instagram || '-'}</td>
              <td className="p-2 border">{user.facebook || '-'}</td>
              <td className="p-2 border">{user.twitter || '-'}</td>
              <td className="p-2 border">
                <Link
                  to={`/admin/users/edit/${user.id}`}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Edit
                </Link>
                <button
                  className="text-red-500 ml-2 hover:text-red-700"
                  onClick={() => handleDeleteUser(user.id)}
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

export default AdminUsers;