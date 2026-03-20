import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { ThemeLanguageProvider } from '@/components/ThemeLanguageProvider'

export const metadata: Metadata = {
  title: 'Employee Database',
  description: 'Employee management dashboard demo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeLanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeLanguageProvider>
      </body>
    </html>
  )
}
