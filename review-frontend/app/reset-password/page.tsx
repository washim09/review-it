import type { Metadata } from 'next'
import { Suspense } from 'react'
import ResetPassword from '@/pages/ResetPassword'

export const metadata: Metadata = {
  title: 'Reset Password | Riviewit',
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ResetPassword />
    </Suspense>
  )
}
