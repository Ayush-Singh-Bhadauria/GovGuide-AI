"use client"

import React, { createContext, useContext } from "react"
import { useSession, signIn, signOut } from "next-auth/react"

// Updated AuthContextType for NextAuth
interface AuthContextType {
  user: any
  isLoading: boolean
  login: (email?: string, password?: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use NextAuth session
  const { data: session, status } = useSession()
  const user = session?.user || null
  const isLoading = status === "loading"

  // NextAuth login (email/password fallback to custom, Google uses signIn)
  const login = async (email?: string, password?: string) => {
    if (!email && !password) {
      // Google or other OAuth
      await signIn("google")
      return true
    }
    // Fallback: custom email/password login
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      // After custom login, force NextAuth session update
      await signIn("credentials", { redirect: false })
      return true
    }
    return false
  }

  const logout = async () => {
    await signOut({ redirect: false })
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
