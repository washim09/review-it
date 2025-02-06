// import CompanyDashboard from '../components/dashboard/CompanyDashboard';

// export default function DashboardPage() {
//   return (
//     <div className="container mx-auto p-6">
//       <CompanyDashboard />
//     </div>
//   );
// }


// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import CompanyDashboard from '../components/dashboard/CompanyDashboard';

// export default function DashboardPage() {
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

//     if (!storedUser || !storedUser.isAdmin) {
//       navigate('/login'); 
//     } else {
//       setUser(storedUser);
//     }
//   }, []);

//   if (!user) return <p>Loading...</p>;

//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-2xl font-bold">Admin Dashboard</h1>
//       <CompanyDashboard />
//     </div>
//   );
// }
