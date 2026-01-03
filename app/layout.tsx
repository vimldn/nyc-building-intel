import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BuildingIQ | NYC Building Intelligence',
  description: 'The most comprehensive NYC building database. 30+ data sources. Violations, complaints, sales, evictions, litigations, permits, and more.',
  keywords: ['NYC', 'building', 'apartment', 'violations', 'landlord', 'rent', 'housing', 'evictions', 'HPD', 'DOB'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
