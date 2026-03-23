import type { Metadata } from 'next'
import Careers from '@/pages/Careers'

export const metadata: Metadata = {
  title: 'Careers | Riviewit',
  description: 'Join the Riviewit team and help shape the future of authentic, genuine reviews.',
  alternates: {
    canonical: '/careers',
  },
}

export default function CareersPage() {
  return (
    <>
      <section className="sr-only" aria-hidden="false">
        <h1>Careers at Riviewit – Join Our Team</h1>
        <p>
          Join the Riviewit team and help shape the future of authentic, genuine reviews. 
          We are building a platform that empowers consumers with honest, transparent product 
          reviews from real users. Be part of our mission to create a trusted review ecosystem.
        </p>
        <h2>Why Work at Riviewit</h2>
        <ul>
          <li>Innovative Culture – Work on cutting-edge review technology</li>
          <li>Remote-First – Flexible work arrangements from anywhere</li>
          <li>Growth Opportunities – Learn and advance your career</li>
          <li>Impact – Help millions make better purchasing decisions</li>
        </ul>
        <h2>Open Positions</h2>
        <p>
          Explore our current job openings in engineering, product, design, marketing, and more. 
          We are always looking for talented individuals who are passionate about building great products.
        </p>
      </section>
      <Careers />
    </>
  )
}
