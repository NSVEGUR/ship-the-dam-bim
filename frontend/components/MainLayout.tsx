"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ship, LayoutDashboard, FileCheck, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MainLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/readiness-report", label: "Readiness Report", icon: FileCheck },
];

export function MainLayout({ children }: MainLayoutProps) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            {/* Sidebar */}
            <aside className="w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                {/* Logo */}
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
                            <Ship className="h-4 w-4" />
                        </div>
                        <span className="text-sm">Ship the BIM</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-lg transition-colors",
                                    isActive
                                        ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom section: Settings + User */}
                <div className="border-t border-gray-200 dark:border-gray-700">
                    {/* Settings */}
                    <div className="p-3 pb-0">
                        <Link
                            href="/settings"
                            className={cn(
                                "flex items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-lg transition-colors",
                                pathname === "/settings"
                                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                            )}
                        >
                            <Settings className="h-4 w-4" />
                            Settings
                        </Link>
                    </div>
                    {/* User */}
                    <div className="p-3">
                        <Link
                            href="/user"
                            className={cn(
                                "flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors",
                                pathname === "/user"
                                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                            )}
                        >
                            <Avatar className="h-7 w-7">
                                <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs">
                                    <User className="h-3.5 w-3.5" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">User</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 overflow-auto">
                {children}
            </main>
        </div>
    );
}
