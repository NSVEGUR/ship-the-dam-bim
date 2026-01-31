"use client";

import { Upload, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function QuickActionsPanel() {
    return (
        <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-gray-900">Quick Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button
                    className="w-full justify-start gap-3 bg-gray-900 hover:bg-gray-800 text-white h-11"
                >
                    <Upload className="h-4 w-4" />
                    Upload Model
                </Button>
                <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-11 border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                    <RefreshCw className="h-4 w-4" />
                    Re-scan Latest
                </Button>
            </CardContent>
        </Card>
    );
}
