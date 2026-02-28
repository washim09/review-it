'use client';
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

interface SupportRequest {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  response?: string;
  createdAt: string;
  updatedAt: string;
}

const AdminSupport: React.FC = () => {
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSupportRequests();
  }, []);

  const fetchSupportRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/support/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch support requests');
      }

      const data = await response.json();
      setSupportRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id: number, status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/support/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update request status');
      }

      // Refresh the data
      fetchSupportRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-300';
      case 'CLOSED': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredRequests = supportRequests.filter(request => {
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 pb-24">
        <div className="p-8">
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 pb-24">
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Support Email Management</h1>
          <p className="text-gray-600">Manage and respond to support requests from users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
            <p className="text-2xl font-bold text-gray-900">{supportRequests.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {supportRequests.filter(r => r.status === 'PENDING').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
            <p className="text-2xl font-bold text-blue-600">
              {supportRequests.filter(r => r.status === 'IN_PROGRESS').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Resolved</h3>
            <p className="text-2xl font-bold text-green-600">
              {supportRequests.filter(r => r.status === 'RESOLVED').length}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, or subject..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Support Requests Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3 border text-left">ID</th>
                  <th className="p-3 border text-left">Name</th>
                  <th className="p-3 border text-left">Email</th>
                  <th className="p-3 border text-left">Subject</th>
                  <th className="p-3 border text-left">Status</th>
                  <th className="p-3 border text-left">Created At</th>
                  <th className="p-3 border text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="p-3 border text-sm">{request.id}</td>
                    <td className="p-3 border text-sm font-medium">{request.name}</td>
                    <td className="p-3 border text-sm">{request.email}</td>
                    <td className="p-3 border text-sm max-w-xs truncate" title={request.subject}>
                      {request.subject}
                    </td>
                    <td className="p-3 border text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="p-3 border text-sm text-gray-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="p-3 border text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          View
                        </button>
                        <select
                          value={request.status}
                          onChange={(e) => updateRequestStatus(request.id, e.target.value as any)}
                          className="text-xs border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No support requests found</div>
            <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* Modal for viewing request details */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Support Request Details</h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.subject}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-4 rounded whitespace-pre-wrap">
                    {selectedRequest.message}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Submitted</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedRequest.createdAt)}</p>
                  </div>
                </div>

                {selectedRequest.response && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Response</label>
                    <div className="text-sm text-gray-900 bg-blue-50 p-4 rounded border border-blue-200">
                      {selectedRequest.response}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Handle reply/respond functionality
                    window.location.href = `mailto:${selectedRequest.email}?subject=Re: ${selectedRequest.subject}`;
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reply via Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport;
