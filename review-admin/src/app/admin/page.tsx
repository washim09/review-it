'use client';
import AdminDashboard from '../../pages/AdminDashboard';
import AdminRoute from '../../components/admin/AdminRoute';
export default function DashboardPage() {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
}
