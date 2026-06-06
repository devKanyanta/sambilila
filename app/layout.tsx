import type { Metadata } from "next"
import "./globals.css"
import { ReactNode } from "react"
import localFont from "next/font/local"

const fredoka = localFont({
  src: "../public/fonts/Fredoka.ttf",
  variable: "--font-fredoka",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Lernopia — Master Any Subject with AI",
  description:
    "Turn your notes into interactive quizzes and smart flashcards. Study smarter, remember longer, and ace your goals.",
  openGraph: {
    title: "Lernopia — AI-Powered Learning Platform",
    description:
      "Master any subject with AI-generated quizzes and flashcards. Upload your notes and start learning smarter today.",
    type: "website",
    siteName: "Lernopia",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lernopia — AI-Powered Learning Platform",
    description:
      "Master any subject with AI-generated quizzes and flashcards.",
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fredoka.variable}`}>
      <body className="bg-bg-main min-h-screen">
        {children}
      </body>
    </html>
  )
}
