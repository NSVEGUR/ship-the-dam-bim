"use client";

import { Card } from "@/components/ui/card";
import { useProject } from "@/components/ProjectContext";

export function ProjectInfoBar() {
    const { currentProject } = useProject();

    const profileName = "IFC Basic";
    const createdDate = "Jan 31, 2026 • 10:30 AM";

    return (
        <Card className="bg-white border border-gray-200 px-4 py-2">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">Project:</span>
                    <span className="text-xs font-medium text-gray-900">{currentProject.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">Profile:</span>
                    <span className="text-xs font-medium text-gray-900">{profileName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">Created:</span>
                    <span className="text-xs font-medium text-gray-900">{createdDate}</span>
                </div>
            </div>
        </Card>
    );
}
