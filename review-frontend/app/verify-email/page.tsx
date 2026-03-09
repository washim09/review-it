import type { Metadata } from 'next'
import { Suspense } from 'react'
import VerifyEmail from '@/pages/VerifyEmail'

export const metadata: Metadata = {
  title: 'Verify Email | Riviewit',
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <VerifyEmail />
    </Suspense>
  )
}
