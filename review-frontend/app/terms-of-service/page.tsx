import type { Metadata } from 'next'
import TermsOfService from '@/pages/TermsOfService'

export const metadata: Metadata = {
  title: 'Terms of Service | Riviewit',
  description: 'Riviewit platform terms of service and conditions of use.',
  alternates: {
    canonical: '/terms-of-service',
  },
}

export default function TermsOfServicePage() {
  return <TermsOfService />
}
