'use client'

import { AuthProvider } from '../../context/AuthContext'
import { ReviewProvider } from '../../context/ReviewContext'
import Footer from '../layout/Footer'
import ScrollToTop from '../common/ScrollToTop'
import DocumentTitleManager from '../common/DocumentTitleManager'

export default function Providers({ children }: { children: React.ReactNode }) {
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
