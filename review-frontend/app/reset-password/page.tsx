import type { Metadata } from 'next'
import ResetPassword from '@/pages/ResetPassword'

export const metadata: Metadata = {
  title: 'Reset Password | ReviewIt',
}

export default function ResetPasswordPage() {
  return <ResetPassword />
}
