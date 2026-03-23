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
  return (
    <>
      <section className="sr-only" aria-hidden="false">
        <h1>Riviewit Privacy Policy</h1>
        <p>
          Learn how Riviewit protects your privacy and manages your personal data. This privacy policy 
          explains what information we collect, how we use it, and your rights regarding your data.
        </p>
        <h2>Information We Collect</h2>
        <p>
          We collect information you provide when registering, writing reviews, and using our platform. 
          This includes your name, email, profile information, and review content with images and videos.
        </p>
        <h2>How We Use Your Information</h2>
        <p>
          Your information is used to provide our review platform services, improve user experience, 
          and communicate with you about your account and our services.
        </p>
        <h2>Data Protection</h2>
        <p>
          We implement industry-standard security measures to protect your personal data from unauthorized 
          access, disclosure, or misuse.
        </p>
      </section>
      <PrivacyPolicy />
    </>
  )
}
