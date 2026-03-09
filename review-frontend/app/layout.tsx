import type { Metadata } from 'next'
import './globals.css'
import Providers from '../src/components/providers/Providers'

export const metadata: Metadata = {
  title: {
    default: 'Riviewit – Genuine Reviews from Real Users | riviewit.com',
    template: '%s | Riviewit',
  },
  description: 'Riviewit is an independent platform for genuine, unsponsored reviews from real users with images and videos. Discover honest product reviews, share your experience, and help others make informed decisions at riviewit.com.',
  keywords: [
    'riviewit', 'riviewit.com', 'review it', 'genuine reviews', 'product reviews',
    'honest reviews', 'user reviews', 'unsponsored reviews', 'real reviews',
    'review platform', 'consumer reviews', 'review website',
  ],
  authors: [{ name: 'Riviewit Team', url: 'https://riviewit.com' }],
  creator: 'Riviewit',
  publisher: 'Riviewit',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: { icon: '/icons/favicon.ico', apple: '/icons/apple-touch-icon.png' },
  manifest: '/manifest.json',
  metadataBase: new URL('https://riviewit.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Riviewit – Genuine Reviews from Real Users',
    description: 'Riviewit is an independent platform for genuine, unsponsored reviews with images and videos. Discover honest reviews and share your experience.',
    url: 'https://riviewit.com',
    siteName: 'Riviewit',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/assets/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Riviewit – Genuine Reviews from Real Users',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Riviewit – Genuine Reviews from Real Users',
    description: 'Genuine, unsponsored reviews from real users with images and videos. Share honest reviews at riviewit.com.',
    images: ['/assets/og-image.png'],
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
  verification: {
    // Add your Google Search Console verification code here after setup
    // google: 'your-google-site-verification-code',
  },
  other: {
    'application-name': 'Riviewit',
  },
}

// JSON-LD Structured Data for Organization and WebSite
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://riviewit.com/#organization',
      name: 'Riviewit',
      url: 'https://riviewit.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://riviewit.com/assets/color_logo.png',
      },
      sameAs: [],
      description: 'Riviewit is an independent platform for genuine, unsponsored reviews from real users.',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://riviewit.com/#website',
      url: 'https://riviewit.com',
      name: 'Riviewit',
      publisher: {
        '@id': 'https://riviewit.com/#organization',
      },
      description: 'Genuine, unsponsored reviews from real users with images and videos.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://riviewit.com/blog?search={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebPage',
      '@id': 'https://riviewit.com/#webpage',
      url: 'https://riviewit.com',
      name: 'Riviewit – Genuine Reviews from Real Users',
      isPartOf: {
        '@id': 'https://riviewit.com/#website',
      },
      about: {
        '@id': 'https://riviewit.com/#organization',
      },
      description: 'Riviewit is an independent platform for genuine, unsponsored reviews from real users with images and videos.',
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
