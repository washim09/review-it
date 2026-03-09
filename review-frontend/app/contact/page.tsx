import type { Metadata } from 'next'
import ContactUs from '@/pages/ContactUs'

export const metadata: Metadata = {
  title: 'Contact Us | Riviewit',
  description: 'Get in touch with the Riviewit team for business inquiries, partnerships, and media relations. We would love to hear from you.',
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactPage() {
  return <ContactUs />
}
