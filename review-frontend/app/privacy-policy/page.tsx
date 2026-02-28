import type { Metadata } from 'next'
import PrivacyPolicy from '@/pages/PrivacyPolicy'

export const metadata: Metadata = {
  title: 'Privacy Policy | Review-It',
  description: 'Learn how Review-It protects your privacy and manages your personal data.',
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />
}
