import type { Metadata } from 'next'
import WriteReview from '@/pages/WriteReview'

export const metadata: Metadata = {
  title: 'Write a Review | ReviewIt',
}

export default function WriteReviewPage() {
  return <WriteReview />
}
