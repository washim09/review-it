import type { Metadata } from 'next'
import ContactUs from '@/pages/ContactUs'

export const metadata: Metadata = {
  title: 'Contact Us | Riviewit',
  description: 'Get in touch with the Riviewit team. We would love to hear from you.',
}

export default function ContactPage() {
  return <ContactUs />
}
