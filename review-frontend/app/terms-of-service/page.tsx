import type { Metadata } from 'next'
import TermsOfService from '@/pages/TermsOfService'

export const metadata: Metadata = {
  title: 'Terms of Service | Riviewit',
  description: 'Riviewit platform terms of service and conditions of use.',
  alternates: {
    canonical: '/terms-of-service',
  },
}

export default function TermsOfServicePage() {
  return (
    <>
      <section className="sr-only" aria-hidden="false">
        <h1>Riviewit Terms of Service</h1>
        <p>
          Riviewit platform terms of service and conditions of use. By using Riviewit, you agree to 
          these terms and conditions governing your use of our review platform.
        </p>
        <h2>User Responsibilities</h2>
        <p>
          Users must provide honest, genuine reviews based on their actual experience. Fake reviews, 
          spam, or misleading content is strictly prohibited on the Riviewit platform.
        </p>
        <h2>Content Ownership</h2>
        <p>
          You retain ownership of your reviews and content. By posting on Riviewit, you grant us 
          permission to display and distribute your content on our platform.
        </p>
        <h2>Platform Rules</h2>
        <p>
          Users must respect our community guidelines, avoid prohibited content, and use the platform 
          in accordance with applicable laws and regulations.
        </p>
      </section>
      <TermsOfService />
    </>
  )
}
