import type { Metadata } from 'next'
import VerifyEmail from '@/pages/VerifyEmail'

export const metadata: Metadata = {
  title: 'Verify Email | ReviewIt',
}

export default function VerifyEmailPage() {
  return <VerifyEmail />
}
