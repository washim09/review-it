import type { Metadata } from 'next'
import BlogPost from '@/pages/BlogPost'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.riviewit.com'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blog/${params.slug}`, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return {
        title: 'Blog Post | Riviewit',
        description: 'Read our latest blog post with helpful tips and insights on Riviewit.',
      }
    }

    const data = await res.json()
    const post = data.post || data

    const title = post.title
      ? `${post.title} | Riviewit Blog`
      : 'Blog Post | Riviewit'

    const description = post.excerpt
      ? post.excerpt.substring(0, 160)
      : post.content
        ? `${post.content.substring(0, 155)}...`
        : 'Read our latest blog post with helpful tips and insights on Riviewit.'

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://riviewit.com/blog/${params.slug}`,
        type: 'article',
        ...(post.coverImage && {
          images: [{ url: post.coverImage, alt: post.title }],
        }),
        ...(post.publishedAt && {
          publishedTime: post.publishedAt,
        }),
      },
      alternates: {
        canonical: `/blog/${params.slug}`,
      },
    }
  } catch {
    return {
      title: 'Blog Post | Riviewit',
      description: 'Read our latest blog post with helpful tips and insights on Riviewit.',
    }
  }
}

export default function BlogPostPage() {
  return <BlogPost />
}
