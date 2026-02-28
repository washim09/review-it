import type { Metadata } from 'next'
import AboutUs from '@/pages/AboutUs'

export const metadata: Metadata = {
  title: 'About Us | Review-It',
  description: 'Learn about Review-It - the platform for honest, transparent reviews that help people make informed decisions.',
}

export default function AboutUsPage() {
  return <AboutUs />
}
