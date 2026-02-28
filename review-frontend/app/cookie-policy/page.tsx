import type { Metadata } from 'next'
import CookiePolicy from '@/pages/CookiePolicy'

export const metadata: Metadata = {
  title: 'Cookie Policy | Review-It',
  description: 'Learn how Review-It uses cookies and similar technologies.',
}

export default function CookiePolicyPage() {
  return <CookiePolicy />
}
