'use client'

import MessagePage from '@/components/messages/MessagePage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function MessagesPage() {
  return <ProtectedRoute><MessagePage /></ProtectedRoute>
}
