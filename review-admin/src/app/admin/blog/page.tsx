'use client';
import AdminBlog from '../../../views/AdminBlog';
import AdminRoute from '../../../components/admin/AdminRoute';

export default function BlogPage() {
  return (
    <AdminRoute>
      <AdminBlog />
    </AdminRoute>
  );
}
