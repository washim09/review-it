import type { Metadata } from 'next'
import UserProfile from '@/pages/UserProfile'

export const metadata: Metadata = {
  title: 'Profile | ReviewIt',
}

export default function ProfilePage() {
  return <UserProfile />
}
