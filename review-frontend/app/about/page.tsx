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
  return (
    <>
      <section className="sr-only" aria-hidden="false">
        <h1>About Riviewit – The Independent Review Platform</h1>
        <p>
          Riviewit is an independent platform dedicated to genuine, unsponsored reviews from real users.
          We believe in transparency, honesty, and helping consumers make informed purchasing decisions
          through authentic user experiences shared with images and videos.
        </p>
        <h2>Our Mission</h2>
        <p>
          Our mission is to create a trusted space where real people share honest reviews about products
          and services they have actually used. No sponsored content, no fake reviews — just genuine
          experiences from real users.
        </p>
        <h2>Why Choose Riviewit</h2>
        <ul>
          <li>Genuine Reviews – All reviews come from verified real users</li>
          <li>Media-Rich Content – Reviews include images and videos for better insights</li>
          <li>Community Driven – Connect directly with reviewers to ask questions</li>
          <li>Independent Platform – No sponsored or paid reviews</li>
        </ul>
      </section>
      <AboutUs />
    </>
  )
}
