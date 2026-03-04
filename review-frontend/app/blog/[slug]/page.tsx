import type { Metadata } from 'next'
import BlogPost from '@/pages/BlogPost'

export const metadata: Metadata = {
  title: 'Blog Post | ReviewIt',
  description: 'Read our latest blog post with helpful tips and insights.',
}

export default function BlogPostPage() {
  return <BlogPost />
}
