"use client";

import { useProject } from "@/components/ProjectContext";
import { Card, CardContent } from "@/components/ui/card";

export function ReadinessScoreHeader() {
    const { currentProject } = useProject();
    const { stats } = currentProject;

    const score = stats.readinessScore;
    const isExcellent = score >= 90;
    const critical = stats.issuesCritical;
    const warning = stats.issuesWarning;
    const info = stats.issuesOk;
    const total = critical + warning + info;

    // Calculate bar percentages
    const criticalPercent = total > 0 ? (critical / total) * 100 : 0;
    const warningPercent = total > 0 ? (warning / total) * 100 : 0;
    const infoPercent = total > 0 ? (info / total) * 100 : 0;
    // Use score for the dark portion
    const scorePercent = score;

    return (
        <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
                {/* Header */}
                <div className="mb-4">
                    <h2 className="text-sm font-semibold text-gray-900">Readiness Score</h2>
                    <p className="text-xs text-gray-500">Overall compliance score for submission readiness</p>
                </div>

                {/* Score and Stats Row */}
                <div className="flex items-end justify-between mb-4">
                    {/* Score */}
                    <div>
                        <span className="text-5xl font-bold text-emerald-500">{score}%</span>
                        <p className="text-sm text-gray-600 mt-1">
                            {isExcellent ? "Excellent - Ready for submission" : "Not ready for submission"}
                        </p>
                    </div>

                    {/* Issue Stats */}
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <span className="text-2xl font-bold text-red-500">{critical}</span>
                            <p className="text-xs text-gray-500">Critical</p>
                        </div>
                        <div className="text-center">
                            <span className="text-2xl font-bold text-amber-500">{warning}</span>
                            <p className="text-xs text-gray-500">Warning</p>
                        </div>
                        <div className="text-center">
                            <span className="text-2xl font-bold text-gray-700">{info}</span>
                            <p className="text-xs text-gray-500">Info</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-3 w-full rounded-full overflow-hidden flex bg-gray-100">
                    <div
                        className="h-full bg-gray-900"
                        style={{ width: `${scorePercent}%` }}
                    />
                    <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${100 - scorePercent}%` }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
