"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, TrendingUp } from "lucide-react"
import { useProject } from "@/components/ProjectContext"

export function ReadinessScoreCard() {
    const { currentProject } = useProject();
    const { stats } = currentProject;

    const score = stats.readinessScore;
    const previousScore = 58;
    const change = score - previousScore;
    const isReady = score >= 95;

    return (
        <Card className="bg-card border-border">
            <CardHeader className="pb-0 pt-3 px-4">
                <CardTitle className="text-sm font-medium text-gray-900">
                    Readiness Score
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
                <div className="flex items-end justify-between">
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-foreground">{score}</span>
                            <span className="text-sm text-muted-foreground">/100</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs">
                            <span className="flex items-center gap-0.5 text-emerald-600">
                                <ArrowUp className="h-3 w-3" />
                                +{change}
                            </span>
                            <span className="text-muted-foreground">from last scan</span>
                        </div>
                    </div>

                    {/* Circular Progress */}
                    <div className="relative h-16 w-16">
                        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="text-gray-200"
                            />
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeDasharray={`${score}, 100`}
                                className="text-emerald-500"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className={`mt-3 rounded-md px-2 py-1.5 ${isReady ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                    <p className={`text-xs font-medium ${isReady ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {isReady ? 'Ready for submission' : 'Not ready for submission'}
                    </p>
                    <p className="text-[10px] text-gray-500">
                        {isReady ? 'All checks passed' : `${stats.issuesCritical} critical issues must be resolved`}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
