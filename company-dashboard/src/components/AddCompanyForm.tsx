"use client";
import { useState } from 'react';

export default function AddCompanyForm({ onCompanyAdded }: { onCompanyAdded: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [logo, setLogo] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLogo(reader.result);
        }
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, website, logo }),
    });

    if (response.ok) {
      alert('Company added successfully!');
      setName('');
      setDescription('');
      setWebsite('');
      setLogo(null);
      onCompanyAdded(); // Refresh company list
    } else {
      alert('Failed to add company');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Add a New Company</h2>

      <input
        type="text"
        placeholder="Company Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded"
        required
      ></textarea>

      <input
        type="url"
        placeholder="Company Website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full p-2 border rounded"
      />

      {logo && <img src={logo} alt="Preview" className="h-16 w-16 my-2" />}

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Add Company
      </button>
    </form>
  );
}
