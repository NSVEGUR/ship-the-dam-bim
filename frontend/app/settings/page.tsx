"use client";

import { useTheme } from "next-themes";
import { Settings as SettingsIcon, Sun, Moon } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();

    return (
        <MainLayout>
            <div className="max-w-2xl space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your preferences</p>
                </div>

                {/* Preferences Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <SettingsIcon className="h-5 w-5 text-gray-500" />
                            <div>
                                <CardTitle className="text-lg">Preferences</CardTitle>
                                <CardDescription>Customize your experience</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Theme */}
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">Theme</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {theme === "dark" ? "Dark mode" : "Light mode"}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={theme === "light" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTheme("light")}
                                    className="gap-1"
                                >
                                    <Sun className="h-4 w-4" />
                                    Light
                                </Button>
                                <Button
                                    variant={theme === "dark" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTheme("dark")}
                                    className="gap-1"
                                >
                                    <Moon className="h-4 w-4" />
                                    Dark
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        {/* Language */}
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">Language</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">English (US)</div>
                            </div>
                            <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300">
                                EN-US
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
