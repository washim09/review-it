import type { Metadata } from 'next'
import Blog from '@/pages/Blog'

export const metadata: Metadata = {
  title: 'Blog | Riviewit',
  description: 'Read the latest articles, tips, and insights about product reviews and consumer guidance on Riviewit.',
  alternates: {
    canonical: '/blog',
  },
}

export default function BlogPage() {
  return <Blog />
}
