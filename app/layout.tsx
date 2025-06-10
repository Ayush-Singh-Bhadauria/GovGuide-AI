import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "../components/theme-provider"
import { AuthProvider } from "../contexts/auth-context"
import { Navigation } from "../components/navigation"
import { Toaster } from "../components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GovGuide AI - Your Government Schemes Assistant",
  description: "Discover and access government schemes, scholarships, and benefits with AI assistance",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="govguide-theme"
        >
          <AuthProvider>
            {/* Main Navigation Bar */}
            <Navigation />

            {/* Main Content */}
            <main className="min-h-screen bg-background">{children}</main>

            {/* Toast Notifications */}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
