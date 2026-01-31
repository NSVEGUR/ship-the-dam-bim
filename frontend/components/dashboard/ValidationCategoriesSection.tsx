"use client";

import { Check, X, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProject } from "@/components/ProjectContext";

// Status icon for each category
function CategoryStatusIcon({ percentage }: { percentage: number }) {
    if (percentage >= 90) {
        return (
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="h-3 w-3 text-emerald-600" />
            </div>
        );
    }
    if (percentage >= 70) {
        return (
            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-3 w-3 text-amber-600" />
            </div>
        );
    }
    return (
        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
            <X className="h-3 w-3 text-red-600" />
        </div>
    );
}

// Progress bar color
function getProgressColor(percentage: number): string {
    if (percentage >= 90) return "bg-emerald-500";
    if (percentage >= 70) return "bg-amber-500";
    return "bg-red-500";
}

export function ValidationCategoriesSection() {
    const { currentProject } = useProject();
    const { stats } = currentProject;

    return (
        <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-gray-900">Validation Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {stats.validationCategories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-3">
                        <CategoryStatusIcon percentage={cat.percentage} />
                        <span className="text-sm font-medium text-gray-900 w-36">{cat.name}</span>
                        <div className="flex-1 flex items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(cat.percentage)}`}
                                    style={{ width: `${cat.percentage}%` }}
                                />
                            </div>
                            <span className="text-sm font-semibold text-gray-700 w-12 text-right">{cat.percentage}%</span>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
