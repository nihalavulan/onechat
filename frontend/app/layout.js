import './globals.css'
import Toaster from '../src/components/Toaster'
import Navbar from '../src/components/Navbar'

export const metadata = {
  title: 'OneChat',
  description: 'OneChat Application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Toaster />
      </body>
    </html>
  )
}

