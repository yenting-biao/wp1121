import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from './_components/Header'
import { SessionProvider } from 'next-auth/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '不揪 Food Date',
  description: 'A food date app.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <SessionProvider>
      <body className={inter.className}>
        <Header /> 
        <div className="h-screen pt-16 overflow-y-scroll">
          {children}
        </div>
      </body>
      </SessionProvider>
    </html>
  )
}
