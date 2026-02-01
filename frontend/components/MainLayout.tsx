"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileCheck, Settings, User, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MainLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/readiness-report", label: "Readiness Report", icon: FileCheck },
    { href: "/reports", label: "Reports", icon: ClipboardList },
];

export function MainLayout({ children }: MainLayoutProps) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background flex">
            {/* Sidebar */}
            <aside className="w-56 bg-white dark:bg-background border-r border-gray-200 dark:border-sidebar-border flex flex-col">
                {/* Logo */}
                <div className="p-3 border-b border-gray-200 dark:border-sidebar-border">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                        {/* Light Mode Logo */}
                        <img
                            src="/logo-light.svg"
                            alt="Ship the BIM"
                            className="h-8 w-auto dark:hidden"
                        />
                        {/* Dark Mode Logo */}
                        <img
                            src="/logo-dark.svg"
                            alt="Ship the BIM"
                            className="h-8 w-auto hidden dark:block"
                        />
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-6 mt-14">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-all",
                                    isActive
                                        ? "bg-emerald-50 dark:bg-[rgba(240,147,98,0.2)] text-emerald-700 dark:text-[#F09362] shadow-sm"
                                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-card dark:hover:shadow-sm"
                                )}>
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom section: Settings + User */}
                <div className="border-t border-gray-200 dark:border-sidebar-border">
                    {/* Settings */}
                    <div className="p-3 pb-0">
                        <Link
                            href="/settings"
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 text-base font-medium rounded-xl transition-all",
                                pathname === "/settings"
                                    ? "bg-emerald-50 dark:bg-sidebar-primary/20 text-emerald-700 dark:text-sidebar-primary shadow-sm"
                                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-card dark:hover:shadow-sm"
                            )}
                        >
                            <Settings className="h-5 w-5" />
                            Settings
                        </Link>
                    </div>
                    {/* User */}
                    <div className="p-3">
                        <Link
                            href="/user"
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 rounded-xl transition-all",
                                pathname === "/user"
                                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm"
                                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-card dark:hover:shadow-sm"
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
