"use client";

import { Card } from "@/components/ui/card";
import { useProject } from "@/components/ProjectContext";

export function ProjectInfoBar() {
    const { currentProject } = useProject();

    return (
        <Card className="bg-white dark:bg-card border border-gray-200 dark:border-gray-700 px-4 py-2">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Project:</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{currentProject.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Language:</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{currentProject.language || "N/A"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Created:</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{currentProject.createdAt || "Unknown"}</span>
                </div>
            </div>
        </Card>
    );
}
