'use client'

import UserProfile from '@/pages/UserProfile'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function ProfilePage() {
  return <ProtectedRoute><UserProfile /></ProtectedRoute>
}
