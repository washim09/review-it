'use client'
import WriteReview from '@/pages/WriteReview'

import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function WriteReviewPage() {
  return <ProtectedRoute><WriteReview /></ProtectedRoute>
}
