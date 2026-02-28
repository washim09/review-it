import type { Metadata } from 'next'
import ForgotPassword from '@/pages/ForgotPassword'

export const metadata: Metadata = {
  title: 'Forgot Password | ReviewIt',
}

export default function ForgotPasswordPage() {
  return <ForgotPassword />
}
