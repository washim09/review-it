'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      console.error('No admin token found. Redirecting to admin login...');
      router.push('/admin-login'); // Redirect to admin login if not authenticated
    }
  }, [router]);

  return <>{children}</>;
};

export default AdminRoute;