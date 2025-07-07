"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "./theme-toggle"
import { useAuth } from "../contexts/auth-context"
import { Home, FileText, User, LogOut, Settings, CreditCard, Bell } from "lucide-react"
import Image from "next/image"

export function Navigation() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  // Handle user logout
  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // Show loading state
  if (isLoading) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 dark:bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                <span className="font-bold text-xl text-foreground">
                  Nagrik Mitra <span className="text-green-600 dark:text-green-400">AI</span>
                </span>
              </Link>
            </div>
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-16 h-16 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Nagrik Mitra Logo"
                  width={64}
                  height={64}
                  className="rounded-lg bg-white"
                  priority
                />
              </div>
              <span className="font-bold text-xl text-foreground">
                Nagrik Mitra <span className="text-green-600 dark:text-green-400">AI</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="flex items-center space-x-1 text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              href="/schemes"
              className="flex items-center space-x-1 text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Schemes</span>
            </Link>
          </div>

          {/* Right Side - Auth & Theme */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Authentication Section */}
            {user ? (
              // User Profile Dropdown
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user.name} />
                      <AvatarFallback className="bg-green-600 dark:bg-green-500 text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/applications')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>My Applications</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/notifications')}>
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Login/Signup Buttons
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild className="hover:bg-muted">
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white"
                  asChild
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
