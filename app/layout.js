import "./globals.css";

export const metadata = {
  title: "TrackHire",
  description: "Track your internship applications",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}