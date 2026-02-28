import type { Metadata } from 'next'
import TermsOfService from '@/pages/TermsOfService'

export const metadata: Metadata = {
  title: 'Terms of Service | Review-It',
  description: 'Review-It platform terms of service and conditions of use.',
}

export default function TermsOfServicePage() {
  return <TermsOfService />
}
