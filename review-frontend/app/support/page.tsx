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
  return (
    <>
      <section className="sr-only" aria-hidden="false">
        <h1>Riviewit Support – Get Help</h1>
        <p>
          Get help and support for using the Riviewit platform. Our support team is here to assist 
          you with account issues, review submissions, technical problems, and general questions.
        </p>
        <h2>Support Topics</h2>
        <ul>
          <li>Account Issues – Help with login, registration, and profile settings</li>
          <li>Review Submission – Guidance on writing and submitting reviews</li>
          <li>Technical Problems – Report bugs and technical issues</li>
          <li>General Questions – Get answers to frequently asked questions</li>
        </ul>
        <h2>Contact Support</h2>
        <p>
          Use our support form below to submit your inquiry. We typically respond within 24 hours.
        </p>
      </section>
      <Support />
    </>
  )
}
