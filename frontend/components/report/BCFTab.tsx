"use client";

import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AISuggestionsPanel } from "./AISuggestionsPanel";

export function BCFTab() {
    return (
        <div className="flex gap-6">
            <Card className="flex-1">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">BCF Export</h3>
                    <p className="text-sm text-gray-500 max-w-md">
                        BCF (BIM Collaboration Format) issues will appear here when issues are exported
                        or imported for collaboration with other BIM tools.
                    </p>
                </CardContent>
            </Card>

            {/* AI Suggestions Panel - empty state since there's no table data */}
            <AISuggestionsPanel
                selectedItem={null}
                suggestion={null}
            />
        </div>
    );
}
