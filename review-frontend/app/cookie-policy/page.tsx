import type { Metadata } from 'next'
import CookiePolicy from '@/pages/CookiePolicy'

export const metadata: Metadata = {
  title: 'Cookie Policy | Riviewit',
  description: 'Learn how Riviewit uses cookies and similar technologies.',
}

export default function CookiePolicyPage() {
  return <CookiePolicy />
}
