"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface ProfileBreadcrumbProps {
  currentPage: string
}

export function ProfileBreadcrumb({ currentPage }: ProfileBreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
      <Link href="/" className="flex items-center hover:text-green-600 dark:hover:text-green-400 transition-colors">
        <Home className="h-4 w-4 mr-1" />
        Home
      </Link>
      <ChevronRight className="h-4 w-4" />
      <span className="text-foreground font-medium">{currentPage}</span>
    </nav>
  )
}
