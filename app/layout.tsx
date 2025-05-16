import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DAAD Gathering 2025',
  description: 'Browse and manage your DAAD Gathering 2025 schedule',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-black text-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold">DAAD Gathering 2025</h1>
              </div>
              <nav>
                <ul className="flex space-x-6">
                  <Link href="/">Browse</Link>
                  <Link href="/download">Download</Link>
                </ul>
              </nav>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
} 