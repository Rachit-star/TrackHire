import "./globals.css"
import Navbar from "./components/Navbar"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        {/* The flex-grow: 1 ensures the children grow to fill all remaining space */}
        <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </body>
    </html>
  )
}