"use client";
import { useEffect, useState } from "react";
import AddCompanyForm from "./AddCompanyForm";

export default function CompanyDashboard() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/companies");
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  if (!isClient) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Company Dashboard</h1>

      <AddCompanyForm onCompanyAdded={fetchCompanies} />

      <h2 className="text-lg font-semibold mt-6">Company List</h2>
      <ul className="space-y-4 mt-4">
        {companies.map((company) => (
          <li key={company.id} className="p-4 bg-gray-100 rounded-lg shadow">
            {company.logo && (
              <img src={company.logo} alt={company.name} className="h-12 w-12 mb-2" />
            )}
            <h3 className="text-xl font-semibold">{company.name}</h3>
            <p>{company.description}</p>
            <a href={company.website} className="text-blue-600 hover:underline">
              {company.website}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
