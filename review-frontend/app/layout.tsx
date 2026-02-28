import type { Metadata } from 'next'
import './globals.css'
import Providers from '../src/components/providers/Providers'

export const metadata: Metadata = {
  title: 'ReviewIt - Genuine Reviews from Real Users',
  description: 'Genuine, unsponsored reviews from real users, with images and videos. Help others make informed decisions with honest reviews.',
  keywords: ['reviews', 'product reviews', 'genuine reviews', 'user reviews', 'honest reviews'],
  authors: [{ name: 'ReviewIt Team' }],
  creator: 'ReviewIt',
  publisher: 'ReviewIt',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://riviewit.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ReviewIt - Genuine Reviews from Real Users',
    description: 'Genuine, unsponsored reviews from real users, with images and videos.',
    url: 'https://riviewit.com',
    siteName: 'ReviewIt',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReviewIt - Genuine Reviews from Real Users',
    description: 'Genuine, unsponsored reviews from real users, with images and videos.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
