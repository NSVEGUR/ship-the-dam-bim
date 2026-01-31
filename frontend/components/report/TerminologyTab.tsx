"use client";

import { useState } from "react";
import { Check, Pencil, MoreHorizontal } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useProject, TerminologyMapping } from "@/components/ProjectContext";
import { AISuggestionsPanel } from "./AISuggestionsPanel";
import { StyledTableContainer } from "./StyledTableContainer";

// Type badge component
function TypeBadge({ type }: { type: string }) {
    const colors: Record<string, string> = {
        Space: "bg-violet-100 text-violet-700",
        Level: "bg-amber-100 text-amber-700",
        Zone: "bg-blue-100 text-blue-700",
        Element: "bg-emerald-100 text-emerald-700",
    };
    return (
        <Badge variant="secondary" className={cn("text-xs font-medium", colors[type] || "bg-gray-100 text-gray-700")}>
            {type}
        </Badge>
    );
}

// Confidence badge with color coding
function ConfidenceBadge({ value }: { value: number }) {
    const getColor = () => {
        if (value >= 90) return "text-emerald-600";
        if (value >= 80) return "text-emerald-500";
        if (value >= 70) return "text-amber-600";
        return "text-red-500";
    };
    return (
        <span className={cn("text-sm font-semibold", getColor())}>{value}%</span>
    );
}

// Source badge
function SourceBadge({ source }: { source: string }) {
    const config: Record<string, { bg: string; text: string; icon: string }> = {
        Glossary: { bg: "bg-violet-50 border-violet-200", text: "text-violet-700", icon: "📖" },
        Rule: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: "📋" },
        Context: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: "💡" },
    };
    const c = config[source] || { bg: "bg-gray-50 border-gray-200", text: "text-gray-700", icon: "📄" };
    return (
        <Badge variant="outline" className={cn("text-xs font-medium border", c.bg, c.text)}>
            {c.icon} {source}
        </Badge>
    );
}

// Status badge
function StatusBadge({ status }: { status: string }) {
    if (status === "ACCEPTED") {
        return (
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
                Accepted
            </Badge>
        );
    }
    return (
        <span className="text-sm text-gray-500">Pending</span>
    );
}

// Mock AI suggestion
const getMockSuggestion = (mapping: TerminologyMapping) => ({
    title: mapping.original,
    confidence: mapping.confidence,
    whyMatters: `The term "${mapping.original}" has been detected in your model. Standardizing this to "${mapping.suggestedEN}" (EN) / "${mapping.suggestedDE}" (DE) ensures consistent terminology across all project documentation.`,
    ifIgnored: `Non-standardized terminology may cause confusion in multi-language projects and inconsistencies in exported documentation.`,
});

export function TerminologyTab() {
    const { currentProject } = useProject();
    const mappings = currentProject.stats.terminologyMappings;
    const [selectedMapping, setSelectedMapping] = useState<TerminologyMapping | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const toggleSelect = (idx: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSet = new Set(selectedIds);
        if (newSet.has(idx)) {
            newSet.delete(idx);
        } else {
            newSet.add(idx);
        }
        setSelectedIds(newSet);
    };

    // Mock types for demo
    const types = ["Space", "Level", "Space", "Level", "Space"];
    const sources = ["Glossary", "Rule", "Context", "Glossary", "Rule"];

    return (
        <div className="flex gap-6">
            <StyledTableContainer className="flex-1">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead className="w-10"></TableHead>
                            <TableHead className="w-20">Type</TableHead>
                            <TableHead>Current Name (EN)</TableHead>
                            <TableHead>Proposed Name (DE)</TableHead>
                            <TableHead className="w-28">Confidence</TableHead>
                            <TableHead className="w-24">Source</TableHead>
                            <TableHead className="w-24">Status</TableHead>
                            <TableHead className="w-28">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mappings.map((mapping, idx) => (
                            <TableRow
                                key={idx}
                                className={cn(
                                    "cursor-pointer transition-colors",
                                    selectedMapping === mapping && "bg-blue-50/50",
                                    "hover:bg-gray-50"
                                )}
                                onClick={() => setSelectedMapping(mapping)}
                            >
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selectedIds.has(idx)}
                                        onCheckedChange={() => {
                                            const newSet = new Set(selectedIds);
                                            if (newSet.has(idx)) {
                                                newSet.delete(idx);
                                            } else {
                                                newSet.add(idx);
                                            }
                                            setSelectedIds(newSet);
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TypeBadge type={types[idx % types.length]} />
                                </TableCell>
                                <TableCell className="font-medium text-gray-900">{mapping.original}</TableCell>
                                <TableCell>
                                    <span className="text-gray-900">{mapping.suggestedDE}</span>
                                    <span className="text-gray-400 ml-2">+2</span>
                                </TableCell>
                                <TableCell>
                                    <ConfidenceBadge value={mapping.confidence} />
                                </TableCell>
                                <TableCell>
                                    <SourceBadge source={sources[idx % sources.length]} />
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={mapping.status} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-emerald-600">
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </StyledTableContainer>

            {/* AI Suggestions Panel */}
            <AISuggestionsPanel
                selectedItem={selectedMapping ? { name: selectedMapping.original } : null}
                suggestion={selectedMapping ? getMockSuggestion(selectedMapping) : null}
                onDismiss={() => setSelectedMapping(null)}
                onAccept={() => setSelectedMapping(null)}
            />
        </div>
    );
}
