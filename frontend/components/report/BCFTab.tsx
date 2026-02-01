"use client";

import { useState } from "react";
import { FileText, Download, FileArchive, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProject } from "@/components/ProjectContext";
import { exportFixPack } from "@/lib/export-utils";

export function BCFTab() {
    const { currentProject } = useProject();
    const [isExporting, setIsExporting] = useState(false);

    // List of files that will be included in the zip
    const filesToExport = [
        { name: "issues.csv", description: "Summary of validation rules and issue counts", icon: FileText },
        { name: "missing_properties.csv", description: "Detailed list of missing properties", icon: FileText },
        { name: "terminology.csv", description: "Terminology mapping proposals", icon: FileText },
        { name: "report.md", description: "Overall readiness report summary", icon: FileText },
    ];

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportFixPack(currentProject);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to create export zip.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex gap-6">
            <Card className="flex-1 bg-white dark:bg-card border-gray-200 dark:border-gray-700">
                <CardHeader>
                    <CardTitle>Export Fix Pack</CardTitle>
                    <CardDescription>
                        Download a package containing all identified issues and suggestions for offline use.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                <FileArchive className="h-4 w-4 text-emerald-600" />
                                Content Preview
                            </h4>
                            <div className="space-y-2">
                                {filesToExport.map((file) => (
                                    <div key={file.name} className="flex items-center gap-3 p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                            <file.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{file.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{file.description}</p>
                                        </div>
                                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="bg-[#F09362] hover:bg-[#F09362]/90 text-white dark:text-gray-900"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {isExporting ? "Zipping..." : "Export Fix Pack (.zip)"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
