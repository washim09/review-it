import type { Metadata } from 'next'
import Register from '@/pages/Register'

export const metadata: Metadata = {
  title: 'Sign Up | Riviewit',
  description: 'Create your Riviewit account to start writing reviews and connecting with the community.',
}

export default function RegisterPage() {
  return <Register />
}
