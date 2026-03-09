import type { Metadata } from 'next'
import PrivacyPolicy from '@/pages/PrivacyPolicy'

export const metadata: Metadata = {
  title: 'Privacy Policy | Riviewit',
  description: 'Learn how Riviewit protects your privacy and manages your personal data.',
  alternates: {
    canonical: '/privacy-policy',
  },
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />
}
