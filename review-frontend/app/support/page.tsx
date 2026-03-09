import type { Metadata } from 'next'
import Support from '@/pages/Support'

export const metadata: Metadata = {
  title: 'Support | Riviewit',
  description: 'Get help and support for using the Riviewit platform.',
  alternates: {
    canonical: '/support',
  },
}

export default function SupportPage() {
  return <Support />
}
