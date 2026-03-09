import Home from '@/pages/Home'

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Riviewit – Genuine Reviews from Real Users',
  description: 'Riviewit is an independent platform for genuine, unsponsored reviews from real users with images and videos. Discover honest product reviews, share your experience, and help others make informed decisions.',
  url: 'https://riviewit.com',
  isPartOf: {
    '@type': 'WebSite',
    name: 'Riviewit',
    url: 'https://riviewit.com',
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      {/* SSR-visible content for search engines */}
      <section className="sr-only" aria-hidden="false">
        <h1>Riviewit – Genuine, Unsponsored Reviews from Real Users</h1>
        <p>
          Welcome to Riviewit, the independent platform where real users share genuine, unsponsored 
          reviews with images and videos. Discover honest product reviews across multiple categories, 
          share your own experience, and help others make informed purchasing decisions. 
          Join thousands of active users who trust Riviewit for authentic consumer reviews.
        </p>
        <h2>How Riviewit Works</h2>
        <ul>
          <li>Write Reviews – Share your honest experience with products and services</li>
          <li>Discover Reviews – Browse reviews from real users to find the best products</li>
          <li>Connect With Reviewers – Message reviewers directly to ask questions</li>
        </ul>
        <h2>Featured Reviews</h2>
        <p>
          Browse our latest genuine reviews from real users. Every review on Riviewit includes 
          detailed ratings, written feedback, and media like images and videos to help you 
          make the best decision.
        </p>
        <nav aria-label="Main navigation">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/register">Sign Up</a></li>
            <li><a href="/login">Login</a></li>
          </ul>
        </nav>
      </section>
      <Home />
    </>
  )
}
