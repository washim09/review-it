'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuth, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuth) {
      router.push('/login');
    }
  }, [isAuth, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // If the user is not authenticated, show nothing (redirect is happening)
  if (!isAuth) {
    return null;
  }

  // If the user is authenticated, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
