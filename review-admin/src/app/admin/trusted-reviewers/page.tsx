'use client';
import AdminRoute from '../../../components/admin/AdminRoute';
import AdminTrustedReviewers from '../../../views/AdminTrustedReviewers';

export default function TrustedReviewersPage() {
  return (
    <AdminRoute>
      <AdminTrustedReviewers />
    </AdminRoute>
  );
}
