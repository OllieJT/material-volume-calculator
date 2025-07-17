import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Material Volume Calculator',
  description: 'Subtract volumes from each other to determine the material needed to fill a void.',
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
