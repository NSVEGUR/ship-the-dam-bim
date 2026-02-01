"use client";

import { useState, useEffect } from "react";
import { Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TypewriterText } from "@/components/ui/TypewriterText";

interface AISuggestion {
    title: string;
    confidence: number;
    whatIsWrong?: string;
    whyItMatters?: string;
    whereToFixIt?: string;
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
    const [typingStage, setTypingStage] = useState(0);

    // Reset typing stage when suggestion changes
    useEffect(() => {
        setTypingStage(0);
    }, [suggestion]);

    // Empty state - Layered approach matching screenshot
    if (!selectedItem) {
        return (
            <div className="ai-gemini-box w-80 shrink-0 h-fit">
                <GeminiBackground />
                <div className="ai-gemini-content p-5">
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center mb-5 shadow-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/20 dark:from-indigo-900/50 dark:via-purple-900/30 dark:to-pink-900/20" />
                            <Sparkles className="h-8 w-8 text-indigo-500 dark:text-indigo-400 relative z-10" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Item Selected</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
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
            <div className="ai-gemini-box w-80 shrink-0 h-fit">
                <GeminiBackground />
                <div className="ai-gemini-content p-5">
                    {/* AI suggestion header at top */}
                    <div className="flex items-center gap-2 text-sm mb-3">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/50 dark:to-violet-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                            AI-assisted suggestion
                        </div>
                    </div>

                    {/* Selected item below */}
                    <div className="mb-4">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Selected</div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedItem.name}</h3>
                    </div>

                    <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4" />
                        <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3" />
                        <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    // No suggestion available
    if (!suggestion) {
        return (
            <div className="ai-gemini-box w-80 shrink-0 h-fit">
                <GeminiBackground />
                <div className="ai-gemini-content p-5">
                    {/* AI suggestion header at top */}
                    <div className="flex items-center gap-2 text-sm mb-3">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/50 dark:to-violet-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                            <Sparkles className="h-3.5 w-3.5" />
                            AI-assisted suggestion
                        </div>
                    </div>

                    {/* Selected item below */}
                    <div className="mb-4">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Selected</div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedItem.name}</h3>
                    </div>

                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-800 dark:to-violet-800 border border-blue-200 dark:border-blue-700 flex items-center justify-center mb-3">
                            <Sparkles className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-48">
                            AI suggestion will be loaded from the API when available
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Full suggestion display
    return (
        <div className="ai-gemini-box w-80 shrink-0 h-fit">
            <GeminiBackground />
            <div className="ai-gemini-content p-5">
                {/* AI suggestion header at top */}
                <div className="flex items-center gap-2 text-sm mb-3">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/50 dark:to-violet-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI-assisted suggestion
                    </div>

                </div>

                {/* Selected item below */}
                <div className="mb-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Selected</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedItem.name}</h3>
                </div>

                <div className="space-y-3">
                    <div>
                        <h4 className="font-medium text-sm mb-1 text-gray-900 dark:text-gray-100">What is wrong</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300 min-h-[1.25rem]">
                            <TypewriterText
                                text={suggestion.whatIsWrong || "No information available."}
                                speed={10}
                                start={typingStage >= 0}
                                onComplete={() => setTypingStage(prev => Math.max(prev, 1))}
                            />
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium text-sm mb-1 text-gray-900 dark:text-gray-100">Why it matters</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300 min-h-[1.25rem]">
                            <TypewriterText
                                text={suggestion.whyItMatters || "No information available."}
                                speed={10}
                                start={typingStage >= 1}
                                onComplete={() => setTypingStage(prev => Math.max(prev, 2))}
                            />
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium text-sm mb-1 text-gray-900 dark:text-gray-100">Where to fix it</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300 min-h-[1.25rem]">
                            <TypewriterText
                                text={suggestion.whereToFixIt || "No information available."}
                                speed={10}
                                start={typingStage >= 2}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 pt-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="w-10 h-10 rounded-full border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            onClick={onDismiss}
                        >
                            <ThumbsDown className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="w-10 h-10 rounded-full border-gray-300 dark:border-gray-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
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
