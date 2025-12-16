import './globals.css'

export const metadata = {
  title: 'DonorConnect - Donor Retention Platform',
  description: 'Improve donor retention through data-driven insights and automated workflows',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
