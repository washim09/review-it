import type { Metadata } from 'next'
import Login from '@/pages/Login'

export const metadata: Metadata = {
  title: 'Login | Riviewit',
  description: 'Sign in to your Riviewit account to write reviews, message users, and more.',
}

export default function LoginPage() {
  return <Login />
}
