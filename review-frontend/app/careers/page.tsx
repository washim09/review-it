import type { Metadata } from 'next'
import Careers from '@/pages/Careers'

export const metadata: Metadata = {
  title: 'Careers | Review-It',
  description: 'Join the Review-It team and help shape the future of authentic reviews.',
}

export default function CareersPage() {
  return <Careers />
}
