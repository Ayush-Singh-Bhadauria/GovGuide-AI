"use client"

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "../components/theme-provider";
import { AuthProvider } from "../contexts/auth-context";
import { Navigation } from "../components/navigation";
import { Toaster } from "../components/ui/toaster";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange={false}
        storageKey="govguide-theme"
      >
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen bg-background">{children}</main>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
