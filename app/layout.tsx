import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import MonitoringInitializer from './components/MonitoringInitializer'
// Removed startup import to prevent SSR issues with contract monitoring

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'VIP Trading Channel - Premium Access',
  description: 'Get exclusive access to our VIP trading signals and strategies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <MonitoringInitializer />
        </Providers>
      </body>
    </html>
  )
}