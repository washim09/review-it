import type { Metadata } from 'next';
import './globals.css';
import AdminNavbar from '../components/AdminNavbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Review Admin Panel',
  description: 'Admin panel for Review It platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AdminNavbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
