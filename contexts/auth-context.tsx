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

  // NextAuth login (Google or credentials)
  const login = async (email?: string, password?: string) => {
    if (!email && !password) {
      await signIn("google")
      return true
    }
    // Use NextAuth credentials provider
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })
    return res?.ok === true
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
