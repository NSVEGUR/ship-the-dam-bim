"use client";

import { Sparkles, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AISuggestion {
    title: string;
    confidence: number;
    whyMatters: string;
    ifIgnored: string;
}

interface AISuggestionsPanelProps {
    selectedItem: { name: string } | null;
    suggestion?: AISuggestion | null;
    isLoading?: boolean;
    onDismiss?: () => void;
    onAccept?: () => void;
}

// Gemini-style animated background with sparkles
function GeminiBackground() {
    return (
        <>
            <div className="ai-gemini-bg" />
            <div className="ai-gemini-shimmer" />
            <div className="ai-sparkle" />
            <div className="ai-sparkle" />
            <div className="ai-sparkle" />
        </>
    );
}

export function AISuggestionsPanel({
    selectedItem,
    suggestion,
    isLoading = false,
    onDismiss,
    onAccept,
}: AISuggestionsPanelProps) {
    // Empty state - Layered approach matching screenshot
    if (!selectedItem) {
        return (
            <div className="w-80 shrink-0 relative pb-20 isolation-auto">
                {/* Background Layer - Wider and Sits Behind */}
                <div className="absolute top-8 -left-4 -right-4 bottom-0 rounded-2xl overflow-hidden -z-10">
                    <GeminiBackground />
                </div>

                {/* Foreground Layer - White Card on Top */}
                <div className="relative z-10 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm h-full">
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
                            <MessageSquare className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Item Selected</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Click on a row in the table to view AI-assisted suggestions
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="ai-gemini-box w-80 shrink-0">
                <GeminiBackground />
                <div className="ai-gemini-content p-5">
                    {/* AI suggestion header at top */}
                    <div className="flex items-center gap-2 text-sm mb-3">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gradient-to-r from-blue-50 to-violet-50 text-blue-700 border border-blue-200">
                            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                            AI-assisted suggestion
                        </div>
                    </div>

                    {/* Selected item below */}
                    <div className="mb-4">
                        <div className="text-xs text-gray-500">Selected</div>
                        <h3 className="text-lg font-semibold text-gray-900">{selectedItem.name}</h3>
                    </div>

                    <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-16 bg-gray-100 rounded" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                        <div className="h-16 bg-gray-100 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    // No suggestion available
    if (!suggestion) {
        return (
            <div className="ai-gemini-box w-80 shrink-0">
                <GeminiBackground />
                <div className="ai-gemini-content p-5">
                    {/* AI suggestion header at top */}
                    <div className="flex items-center gap-2 text-sm mb-3">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gradient-to-r from-blue-50 to-violet-50 text-blue-700 border border-blue-200">
                            <Sparkles className="h-3.5 w-3.5" />
                            AI-assisted suggestion
                        </div>
                    </div>

                    {/* Selected item below */}
                    <div className="mb-4">
                        <div className="text-xs text-gray-500">Selected</div>
                        <h3 className="text-lg font-semibold text-gray-900">{selectedItem.name}</h3>
                    </div>

                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 border border-blue-200 flex items-center justify-center mb-3">
                            <Sparkles className="h-5 w-5 text-blue-500" />
                        </div>
                        <p className="text-xs text-gray-500 max-w-48">
                            AI suggestion will be loaded from the API when available
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Full suggestion display
    return (
        <div className="ai-gemini-box w-80 shrink-0">
            <GeminiBackground />
            <div className="ai-gemini-content p-5">
                {/* AI suggestion header at top */}
                <div className="flex items-center gap-2 text-sm mb-3">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gradient-to-r from-blue-50 to-violet-50 text-blue-700 border border-blue-200">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI-assisted suggestion
                    </div>
                    <span className="text-gray-500">{suggestion.confidence}%</span>
                </div>

                {/* Selected item below */}
                <div className="mb-4">
                    <div className="text-xs text-gray-500">Selected</div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedItem.name}</h3>
                </div>

                <div className="space-y-3">
                    <div>
                        <h4 className="font-medium text-sm mb-1 text-gray-900">Why this matters</h4>
                        <p className="text-sm text-gray-600">{suggestion.whyMatters}</p>
                    </div>

                    <div>
                        <h4 className="font-medium text-sm mb-1 text-gray-900">If ignored</h4>
                        <p className="text-sm text-gray-600">{suggestion.ifIgnored}</p>
                    </div>

                    <div className="flex items-center justify-center gap-4 pt-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="w-10 h-10 rounded-full border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                            onClick={onDismiss}
                        >
                            <ThumbsDown className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="w-10 h-10 rounded-full border-gray-300 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
                            onClick={onAccept}
                        >
                            <ThumbsUp className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
