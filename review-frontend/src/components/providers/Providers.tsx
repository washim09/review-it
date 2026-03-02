'use client'

import { useEffect } from 'react'
import { AuthProvider } from '../../context/AuthContext'
import { ReviewProvider } from '../../context/ReviewContext'
import Footer from '../layout/Footer'
import ScrollToTop from '../common/ScrollToTop'
import DocumentTitleManager from '../common/DocumentTitleManager'

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])
  return (
    <AuthProvider>
      <ReviewProvider>
        <DocumentTitleManager />
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <ScrollToTop />
        </div>
      </ReviewProvider>
    </AuthProvider>
  )
}
