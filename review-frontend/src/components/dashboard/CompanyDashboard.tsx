// import { useEffect, useState } from 'react';

// interface Company {
//   id: number;
//   name: string;
//   industry: string;
//   description?: string;
//   logoUrl?: string;
//   contact?: string;
//   website?: string;
// }

// export default function CompanyDashboard() {
//   const [companies, setCompanies] = useState<Company[]>([]);

//   useEffect(() => {
//     fetch('/api/companies')
//       .then(res => res.json())
//       .then(data => setCompanies(data))
//       .catch(err => console.error('Failed to fetch companies', err));
//   }, []);

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h1 className="text-2xl font-bold mb-4">Company Dashboard</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {companies.map(company => (
//           <div key={company.id} className="bg-white p-4 shadow-md rounded-md">
//             {company.logoUrl && <img src={company.logoUrl} alt={company.name} className="h-20 mx-auto" />}
//             <h2 className="text-xl font-semibold mt-2">{company.name}</h2>
//             <p className="text-sm text-gray-600">{company.industry}</p>
//             {company.website && (
//               <a href={company.website} className="text-blue-500 text-sm" target="_blank">
//                 Visit Website
//               </a>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
