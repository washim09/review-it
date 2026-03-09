import type { Metadata } from 'next'
import Blog from '@/pages/Blog'

export const metadata: Metadata = {
  title: 'Blog | Riviewit',
  description: 'Read the latest articles, tips, and insights about product reviews and consumer guidance on Riviewit.',
  alternates: {
    canonical: '/blog',
  },
}

const blogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Riviewit Blog',
  description: 'Expert insights, tips, and guides to help you make better purchasing decisions. Read articles on product reviews and consumer guidance.',
  url: 'https://riviewit.com/blog',
  publisher: {
    '@type': 'Organization',
    name: 'Riviewit',
    url: 'https://riviewit.com',
  },
}

export default function BlogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      {/* SSR-visible content for search engines */}
      <section className="sr-only" aria-hidden="false">
        <h1>Riviewit Blog – Expert Reviews, Tips & Guides</h1>
        <p>
          Welcome to the Riviewit blog. Read the latest articles, expert insights, tips, and guides 
          about product reviews and consumer guidance. Our blog covers topics including technology reviews, 
          buying guides, review tips, industry news, and more to help you make informed purchasing decisions.
        </p>
        <nav aria-label="Blog categories">
          <ul>
            <li><a href="/blog">All Articles</a></li>
            <li><a href="/blog?category=Technology">Technology</a></li>
            <li><a href="/blog?category=Reviews">Reviews</a></li>
            <li><a href="/blog?category=Tips">Tips</a></li>
            <li><a href="/blog?category=News">News</a></li>
            <li><a href="/blog?category=Guides">Guides</a></li>
          </ul>
        </nav>
      </section>
      <Blog />
    </>
  )
}
