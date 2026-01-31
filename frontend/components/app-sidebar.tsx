"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Upload,
  FileCheck,
  AlertCircle,
  Globe,
  BookText,
  Package,
  Plug,
  Key,
  Settings,
  ChevronDown,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Upload & Scan", href: "/upload", icon: Upload },
  { name: "Readiness", href: "/readiness", icon: FileCheck },
  { name: "Issues", href: "/issues", icon: AlertCircle },
  { name: "Market Profiles", href: "/profiles", icon: Globe },
  { name: "Terminology", href: "/terminology", icon: BookText },
  { name: "Fix Packs", href: "/fix-packs", icon: Package },
  { name: "Integrations", href: "/integrations", icon: Plug },
  { name: "API Access", href: "/api-access", icon: Key },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-56 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-foreground">
            <span className="text-sm font-bold text-background">D</span>
          </div>
          <span className="text-sm font-semibold text-foreground">DeliverableOps</span>
        </Link>
      </div>

      {/* Project Selector */}
      <div className="border-b border-border p-3">
        <button className="flex w-full items-center justify-between rounded-md bg-sidebar-accent px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/80">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span>Berlin Office Tower</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
            MK
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">Max Klein</p>
            <p className="truncate text-xs text-muted-foreground">BIM Coordinator</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
