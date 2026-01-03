import './globals.css'
import Toaster from '../src/components/Toaster'

export const metadata = {
  title: 'OneChat',
  description: 'OneChat Application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

