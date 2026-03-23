import type { Metadata } from 'next'
import AboutUs from '@/pages/AboutUs'

export const metadata: Metadata = {
  title: 'About Us | Riviewit',
  description: 'Learn about Riviewit - the independent platform for honest, transparent reviews that help people make informed decisions.',
  alternates: {
    canonical: '/about-us',
  },
}

export default function AboutUsPage() {
  return (
    <>
      <section className="sr-only" aria-hidden="false">
        <h1>About Riviewit – Independent Review Platform</h1>
        <p>
          Learn about Riviewit, the independent platform for honest, transparent, and genuine reviews 
          from real users. We help people make informed purchasing decisions through authentic user experiences.
        </p>
        <h2>Our Story</h2>
        <p>
          Riviewit was founded to create a trusted space where consumers can share and discover genuine 
          product reviews without sponsored content or fake testimonials.
        </p>
        <h2>What Makes Us Different</h2>
        <ul>
          <li>Independent Platform – No sponsored or paid reviews</li>
          <li>Real User Content – All reviews from verified users</li>
          <li>Media-Rich Reviews – Images and videos for better insights</li>
          <li>Community Driven – Direct communication with reviewers</li>
        </ul>
      </section>
      <AboutUs />
    </>
  )
}
