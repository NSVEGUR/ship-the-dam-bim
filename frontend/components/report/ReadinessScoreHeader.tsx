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

    // Color logic
    const getColorClass = (value: number) => {
        if (value >= 80) return "text-emerald-500";
        if (value >= 50) return "text-amber-500";
        return "text-red-500";
    };

    const getBgColorClass = (value: number) => {
        if (value >= 80) return "bg-emerald-500";
        if (value >= 50) return "bg-amber-500";
        return "bg-red-500";
    };

    const scoreColor = getColorClass(score);
    const barColor = getBgColorClass(score);

    return (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
                {/* Header */}
                <div className="mb-4">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Readiness Score</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Overall compliance score for submission readiness</p>
                </div>

                {/* Score and Stats Row */}
                <div className="flex items-end justify-between mb-4">
                    {/* Score */}
                    <div>
                        <span className={`text-5xl font-bold ${scoreColor}`}>{score}%</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {isExcellent ? "Excellent - Ready for submission" : "Not ready for submission"}
                        </p>
                    </div>

                    {/* Issue Stats */}
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <span className="text-2xl font-bold text-red-500 dark:text-red-400">{critical}</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Critical</p>
                        </div>
                        <div className="text-center">
                            <span className="text-2xl font-bold text-amber-500 dark:text-amber-400">{warning}</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Warning</p>
                        </div>
                        <div className="text-center">
                            <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">{info}</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Info</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-3 w-full rounded-full overflow-hidden flex bg-gray-100 dark:bg-gray-700">
                    <div
                        className={`h-full ${barColor}`}
                        style={{ width: `${score}%` }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
