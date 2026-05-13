import "./globals.css"
import Navbar from "./components/Navbar"

export const metadata = {
  title: "TrackHire",
  description: "Track your internship applications",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}