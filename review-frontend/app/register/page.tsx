import type { Metadata } from 'next'
import Register from '@/pages/Register'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your Riviewit account to start writing reviews and connecting with the community.',
  robots: { index: false, follow: false },
}

export default function RegisterPage() {
  return <Register />
}
