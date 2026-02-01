"use client";

import { User } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function UserPage() {
    return (
        <MainLayout>
            <div className="max-w-2xl space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">User Profile</h1>
                    <p className="text-gray-500 dark:text-gray-400">Your account information</p>
                </div>

                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-gray-500" />
                            <div>
                                <CardTitle className="text-lg">Profile</CardTitle>
                                <CardDescription>Your account details</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* User Info */}
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-violet-600 flex items-center justify-center text-white text-lg font-medium">
                                L
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">Levin Wilke</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <span>✉️</span>
                                    levin.wilke05@gmail.com
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* User ID */}
                        <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">User ID</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">user_e9bea4edf00</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
