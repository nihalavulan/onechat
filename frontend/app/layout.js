import './globals.css'

export const metadata = {
  title: 'OneChat',
  description: 'OneChat Application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

