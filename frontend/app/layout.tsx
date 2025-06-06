import type { Metadata } from 'next'
import '../styles.css' // Assuming this is the main stylesheet

export const metadata: Metadata = {
  title: 'Typing Battle',
  description: 'A multiplayer real-time typing game.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
