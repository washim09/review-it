import type { Metadata } from 'next'
import MessagePage from '@/components/messages/MessagePage'

export const metadata: Metadata = {
  title: 'Messages | ReviewIt',
}

export default function MessageContactPage() {
  return <MessagePage />
}
