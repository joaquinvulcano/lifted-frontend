import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lifted',
  description: 'Gym tracker con sobrecarga progresiva',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${geist.className} bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
