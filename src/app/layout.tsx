import type { Viewport } from 'next'
import { TRPCReactProvider } from '@/trpc/react'
import { ClerkProvider } from '@clerk/nextjs'

import '@/styles/globals.css'
import TopNav from './_components/topNav'

const DEFAULT_TITLE = '3ds'

export const metadata = {
  manifest: '/manifest.json',
  description: 'Generated by create-t3-app',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/icon.png',
  },
  title: DEFAULT_TITLE,
}

export const viewport: Viewport = {
  themeColor: '#15232d',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <TRPCReactProvider>
          <body>
            <div className='flex min-h-screen flex-col bg-cb-dark-blue text-cb-white'>
              <TopNav />
              {children}
            </div>
          </body>
        </TRPCReactProvider>
      </html>
    </ClerkProvider>
  )
}
