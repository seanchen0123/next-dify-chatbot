import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import { NavigationProgress } from '@/components/nprogress'
import 'nprogress/nprogress.css'
import './globals.css'

const inter = Inter({
  variable: '--font-inder',
  subsets: ['latin']
})

export const metadata: Metadata = {
  metadataBase: new URL('https://chat.vercel.ai'),
  title: 'AI Chat Assistant',
  description: 'Interactive AI chat assistant powered by Next.js.'
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Disable auto-zoom on mobile Safari
  userScalable: false
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster 
            position="top-center" 
            toastOptions={{
              classNames: {
                success: 'group border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100',
                error: 'group border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100',
                info: 'group border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100',
                warning: 'group border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
