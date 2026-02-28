import type { Metadata } from 'next'
import Login from '@/pages/Login'

export const metadata: Metadata = {
  title: 'Login | ReviewIt',
  description: 'Sign in to your ReviewIt account to write reviews, message users, and more.',
}

export default function LoginPage() {
  return <Login />
}
