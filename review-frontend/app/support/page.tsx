import type { Metadata } from 'next'
import Support from '@/pages/Support'

export const metadata: Metadata = {
  title: 'Support | Review-It',
  description: 'Get help and support for using the Review-It platform.',
}

export default function SupportPage() {
  return <Support />
}
