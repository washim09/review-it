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
  return (
    <>
      <section className="sr-only" aria-hidden="false">
        <h1>Contact Riviewit – Get in Touch</h1>
        <p>
          Get in touch with the Riviewit team for business inquiries, partnerships, media relations, 
          and advertising opportunities. We would love to hear from you and explore how we can work together.
        </p>
        <h2>Ways to Contact Us</h2>
        <ul>
          <li>Email – Send us a message at contact@riviewit.com</li>
          <li>Business Hours – Monday to Friday, 9 AM to 6 PM EST</li>
          <li>Office Location – Contact us for our office address</li>
        </ul>
        <h2>Contact Form</h2>
        <p>
          Fill out our contact form below to reach our team. We typically respond within 24-48 hours 
          for all business inquiries, partnership requests, and media relations.
        </p>
      </section>
      <ContactUs />
    </>
  )
}
