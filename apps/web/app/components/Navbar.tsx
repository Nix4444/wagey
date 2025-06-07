"use client"

import {TrendingUp, History,BriefcaseBusiness,LayoutDashboard } from "lucide-react"
import Link from "next/link"
import UserAvatar from "./UserAvatar"

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6 md:px-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Wagey</span>
        </div>

        <div className="ml-8 hidden md:flex items-center space-x-10">
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/dashboard/predictions" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
            <BriefcaseBusiness className="h-4 w-4" />
            Holdings
          </Link>
          <Link href="/dashboard/history" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
            <History className="h-4 w-4" />
            History
          </Link>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <UserAvatar />
        </div>
      </div>
    </nav>
  )
} 