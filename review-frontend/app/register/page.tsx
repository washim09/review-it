import type { Metadata } from 'next'
import Register from '@/pages/Register'

export const metadata: Metadata = {
  title: 'Sign Up | ReviewIt',
  description: 'Create your ReviewIt account to start writing reviews and connecting with the community.',
}

export default function RegisterPage() {
  return <Register />
}
