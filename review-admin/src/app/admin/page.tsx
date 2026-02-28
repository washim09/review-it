'use client';
import AdminDashboard from '../../views/AdminDashboard';
import AdminRoute from '../../components/admin/AdminRoute';
export default function DashboardPage() {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
}
