'use client';
import React from 'react';
import NewsletterAdmin from '../components/admin/NewsletterAdmin';

const AdminNewsletter: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Newsletter Management</h1>
          <p className="text-gray-600 mt-2">
            Manage email subscriptions and send newsletters to your subscribers
          </p>
        </div>
        
        <NewsletterAdmin />
      </div>
    </div>
  );
};

export default AdminNewsletter;
