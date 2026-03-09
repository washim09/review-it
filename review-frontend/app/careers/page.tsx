import type { Metadata } from 'next'
import Careers from '@/pages/Careers'

export const metadata: Metadata = {
  title: 'Careers | Riviewit',
  description: 'Join the Riviewit team and help shape the future of authentic, genuine reviews.',
  alternates: {
    canonical: '/careers',
  },
}

export default function CareersPage() {
  return <Careers />
}
