"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Bell, HelpCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

const tabs = [
  { name: "Overview", href: "/dashboard" },
  { name: "Models", href: "/dashboard/models" },
  { name: "Scans", href: "/dashboard/scans" },
  { name: "Activity", href: "/dashboard/activity" },
]

export function TopNav() {
  const pathname = usePathname()

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-6">
        {/* Breadcrumb / Page Title */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Projects</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">Berlin Office Tower</span>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                {tab.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>

        {/* Help */}
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* New Scan Button */}
        <Button size="sm" className="ml-2 h-8">
          New Scan
        </Button>
      </div>
    </header>
  )
}
