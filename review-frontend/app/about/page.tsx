import type { Metadata } from 'next'
import AboutUs from '@/pages/AboutUs'

export const metadata: Metadata = {
  title: 'About Us | Riviewit',
  description: 'Learn about Riviewit - the independent platform for honest, transparent, and genuine reviews from real users.',
  alternates: {
    canonical: '/about',
  },
}

export default function AboutPage() {
  return <AboutUs />
}
