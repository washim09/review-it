import type { Metadata } from 'next'
import CookiePolicy from '@/pages/CookiePolicy'

export const metadata: Metadata = {
  title: 'Cookie Policy | Riviewit',
  description: 'Learn how Riviewit uses cookies and similar technologies.',
  alternates: {
    canonical: '/cookie-policy',
  },
}

export default function CookiePolicyPage() {
  return (
    <>
      <section className="sr-only" aria-hidden="false">
        <h1>Riviewit Cookie Policy</h1>
        <p>
          Learn how Riviewit uses cookies and similar technologies to improve your experience on our platform. 
          This cookie policy explains what cookies we use and how you can manage your cookie preferences.
        </p>
        <h2>What Are Cookies</h2>
        <p>
          Cookies are small text files stored on your device when you visit our website. They help us 
          remember your preferences and improve your browsing experience on Riviewit.
        </p>
        <h2>How We Use Cookies</h2>
        <p>
          We use cookies for authentication, remembering your preferences, analytics, and improving 
          platform functionality. Essential cookies are required for the platform to work properly.
        </p>
        <h2>Managing Cookies</h2>
        <p>
          You can control and manage cookies through your browser settings. However, disabling essential 
          cookies may affect your ability to use certain features of the Riviewit platform.
        </p>
      </section>
      <CookiePolicy />
    </>
  )
}
