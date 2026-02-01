"use client";

import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProject } from "@/components/ProjectContext";

export function IssuesSummaryCard() {
    const { currentProject } = useProject();
    const { stats } = currentProject;

    const critical = stats.issuesCritical;
    const warning = stats.issuesWarning;
    const info = stats.issuesOk;
    const total = critical + warning + info;

    const criticalPercent = total > 0 ? (critical / total) * 100 : 0;
    const warningPercent = total > 0 ? (warning / total) * 100 : 0;
    const infoPercent = total > 0 ? (info / total) * 100 : 0;

    return (
        <Card className="bg-white dark:bg-card border border-gray-200 dark:border-gray-700 h-full">
            <CardHeader className="pb-0 pt-3 px-4">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Issues Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-3">
                {/* Total issues */}
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{total}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">total issues</span>
                </div>

                {/* Issue breakdown */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                            <AlertCircle className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                        </div>
                        <span className="text-xs text-gray-700 dark:text-gray-300">Critical</span>
                        <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 ml-auto">{critical}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                        </div>
                        <span className="text-xs text-gray-700 dark:text-gray-300">Warning</span>
                        <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 ml-auto">{warning}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                            <Info className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                        </div>
                        <span className="text-xs text-gray-700 dark:text-gray-300">Info</span>
                        <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 ml-auto">{info}</span>
                    </div>
                </div>

                {/* Stacked bar */}
                <div className="h-1.5 w-full rounded-full overflow-hidden flex bg-gray-100 dark:bg-gray-700">
                    {criticalPercent > 0 && (
                        <div className="h-full bg-red-500" style={{ width: `${criticalPercent}%` }} />
                    )}
                    {warningPercent > 0 && (
                        <div className="h-full bg-amber-500" style={{ width: `${warningPercent}%` }} />
                    )}
                    {infoPercent > 0 && (
                        <div className="h-full bg-blue-500" style={{ width: `${infoPercent}%` }} />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
