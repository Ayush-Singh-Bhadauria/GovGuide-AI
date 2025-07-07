import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "../components/theme-provider"
import ClientRoot from "../components/ClientRoot"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Nagrik Mitra AI - Your Government Schemes Assistant",
  description: "Discover and access government schemes, scholarships, and benefits with AI assistance",
  generator: 'v0.dev',
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png"
  },
  openGraph: {
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Nagrik Mitra Logo"
      }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  )
}
