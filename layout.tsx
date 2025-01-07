'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { Sidebar } from '@/components/Sidebar'
import { SearchBar } from '@/components/SearchBar'
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs'
import { useSettings } from '@/lib/store/settings'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { theme, fontSize } = useSettings()

  // Apply theme and font size
  useEffect(() => {
    const root = window.document.documentElement
    root.style.fontSize = `${fontSize}px`

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.toggle('dark', systemTheme === 'dark')
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }, [theme, fontSize])

  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <SignedOut>
            {children}
          </SignedOut>
          <SignedIn>
            <div className="h-screen flex flex-col overflow-hidden">
              <SearchBar />
              <div className="flex-1 flex min-h-0">
                <Sidebar />
                <main className="flex-1 overflow-hidden">
                  {children}
                </main>
              </div>
            </div>
          </SignedIn>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}

