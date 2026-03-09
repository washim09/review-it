import type { Metadata } from 'next'
import ReviewDetail from '@/pages/ReviewDetail'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.riviewit.com'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/reviews/${params.id}`, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return {
        title: 'Review | Riviewit',
        description: 'Read genuine, unsponsored reviews from real users on Riviewit.',
      }
    }

    const data = await res.json()
    const review = data.review || data

    const title = review.productName
      ? `${review.productName} Review | Riviewit`
      : `Review | Riviewit`

    const description = review.content
      ? `${review.content.substring(0, 155)}...`
      : 'Read genuine, unsponsored reviews from real users on Riviewit.'

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://riviewit.com/review/${params.id}`,
        type: 'article',
      },
      alternates: {
        canonical: `/review/${params.id}`,
      },
    }
  } catch {
    return {
      title: 'Review | Riviewit',
      description: 'Read genuine, unsponsored reviews from real users on Riviewit.',
    }
  }
}

export default function ReviewPage({ params }: { params: { id: string } }) {
  return <ReviewDetail />
}
