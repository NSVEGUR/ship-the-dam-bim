"use client";

import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProject } from "@/components/ProjectContext";

export function ValidationCategoriesCards() {
    const { currentProject } = useProject();
    const { stats } = currentProject;

    return (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-full flex flex-col">
            <CardHeader className="pb-0 pt-3 px-4">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Validation Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 grid grid-cols-3 gap-3 flex-1">
                {stats.validationCategories.map((cat) => (
                    <div
                        key={cat.id}
                        className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {cat.percentage.toFixed(1)}%
                            </span>
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300 flex-1">{cat.name}</span>
                        <div className="h-1 w-full bg-gray-100 dark:bg-gray-600 rounded-full overflow-hidden mt-2">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${cat.percentage}%` }}
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
