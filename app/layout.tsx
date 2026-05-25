import "./globals.css"
import { ReactNode } from "react"
import localFont from "next/font/local"

const fredoka = localFont({
  src: "../public/fonts/Fredoka.ttf",
  variable: "--font-heading",
  display: "swap",
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fredoka.variable}`}>
      <body className="bg-bg-main min-h-screen">
        {children}
      </body>
    </html>
  )
}