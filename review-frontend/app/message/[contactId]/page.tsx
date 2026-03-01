'use client'
import MessagePage from '@/components/messages/MessagePage'

import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function MessageContactPage() {
  return <ProtectedRoute><MessagePage /></ProtectedRoute>
}
