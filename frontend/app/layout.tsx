import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css' // Assuming this is the main stylesheet
import { GameProvider } from '@/lib/GameProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Typing Battle',
  description: 'Real-time multiplayer typing game',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  )
}
