'use client'

import { Suspense } from 'react'
import AuthCallback from '@/pages/AuthCallback'

function CallbackLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Completing Google sign in...</p>
        <p className="text-white/60 text-sm mt-2">Please wait while we authenticate you</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <AuthCallback />
    </Suspense>
  )
}
