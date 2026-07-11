import type { Metadata } from 'next'
import CompleteProfile from '@/pages/CompleteProfile'

export const metadata: Metadata = {
  title: 'Complete Your Profile | Riviewit',
  description: 'Add your personal details, location, and social media links to personalize your Riviewit experience.',
}

export default function CompleteProfilePage() {
  return <CompleteProfile />
}
