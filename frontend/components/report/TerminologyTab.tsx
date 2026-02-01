"use client";

import { useState } from "react";
import { Check, X, Pencil, MoreHorizontal, Save, XCircle } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useProject, TerminologyMapping } from "@/components/ProjectContext";
import { StyledTableContainer } from "./StyledTableContainer";

// Type badge component
function TypeBadge({ type }: { type: string }) {
    const colors: Record<string, string> = {
        Space: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
        Level: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
        Zone: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
        Element: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    };
    return (
        <Badge variant="secondary" className={cn("text-xs font-medium", colors[type] || "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300")}>
            {type}
        </Badge>
    );
}

// Confidence badge with color coding
function ConfidenceBadge({ value }: { value: number }) {
    const getColor = () => {
        if (value >= 90) return "text-emerald-600 dark:text-emerald-400";
        if (value >= 80) return "text-emerald-500 dark:text-emerald-400";
        if (value >= 70) return "text-amber-600 dark:text-amber-400";
        return "text-red-500 dark:text-red-400";
    };
    return (
        <span className={cn("text-sm font-semibold", getColor())}>{value}%</span>
    );
}

// Source badge
function SourceBadge({ source }: { source: string }) {
    const config: Record<string, { bg: string; text: string; icon: string }> = {
        Glossary: { bg: "bg-violet-50 dark:bg-violet-900/30 border-violet-200 dark:border-violet-800", text: "text-violet-700 dark:text-violet-400", icon: "📖" },
        Rule: { bg: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400", icon: "📋" },
        Context: { bg: "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400", icon: "💡" },
    };
    const c = config[source] || { bg: "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600", text: "text-gray-700 dark:text-gray-300", icon: "📄" };
    return (
        <Badge variant="outline" className={cn("text-xs font-medium border", c.bg, c.text)}>
            {c.icon} {source}
        </Badge>
    );
}

// Status badge
function StatusBadge({ status }: { status: "PROPOSED" | "ACCEPTED" | "REJECTED" }) {
    if (status === "ACCEPTED") {
        return (
            <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border-0">
                Accepted
            </Badge>
        );
    }
    if (status === "REJECTED") {
        return (
            <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border-0">
                Rejected
            </Badge>
        );
    }
    return (
        <span className="text-sm text-gray-500 dark:text-gray-400">Pending</span>
    );
}



export function TerminologyTab() {
    const { currentProject, updateTerminologyStatus, updateTerminologySuggestion } = useProject();
    const mappings = currentProject.stats.terminologyMappings;
    const [selectedMapping, setSelectedMapping] = useState<TerminologyMapping | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Inline editing state
    const [editingTerm, setEditingTerm] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

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

    const handleEditStart = (mapping: TerminologyMapping, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingTerm(mapping.original);
        setEditValue(mapping.suggestedDE);
    };

    const handleEditSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (editingTerm) {
            updateTerminologySuggestion(currentProject.id, editingTerm, editValue);
            setEditingTerm(null);
        }
    };

    const handleEditCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingTerm(null);
    };

    const handleApprove = (originalTerm: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        updateTerminologyStatus(currentProject.id, originalTerm, "ACCEPTED");
        if (selectedMapping?.original === originalTerm) {
            setSelectedMapping(null); // Deselect after action
        }
    };

    const handleReject = (originalTerm: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        updateTerminologyStatus(currentProject.id, originalTerm, "REJECTED");
        if (selectedMapping?.original === originalTerm) {
            setSelectedMapping(null); // Deselect after action
        }
    };

    // AI Panel Actions
    const handleAIAccept = () => {
        if (selectedMapping) {
            handleApprove(selectedMapping.original);
        }
    };

    const handleAIDismiss = () => {
        if (selectedMapping) {
            handleReject(selectedMapping.original);
        }
    };

    // Mock types and sources (unchanged logic for now as they are not actionable)
    const types = ["Space", "Level", "Space", "Level", "Space"];
    const sources = ["Glossary", "Rule", "Context", "Glossary", "Rule"];

    return (
        <div className="flex gap-6">
            <StyledTableContainer className="flex-1">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                            <TableHead className="w-10"></TableHead>
                            <TableHead className="w-20 text-gray-600 dark:text-gray-400">Type</TableHead>
                            <TableHead className="text-gray-600 dark:text-gray-400">Current Name (EN)</TableHead>
                            <TableHead className="text-gray-600 dark:text-gray-400">Proposed Name (DE)</TableHead>
                            <TableHead className="w-28 text-gray-600 dark:text-gray-400">Confidence</TableHead>
                            <TableHead className="w-24 text-gray-600 dark:text-gray-400">Source</TableHead>
                            <TableHead className="w-24 text-gray-600 dark:text-gray-400">Status</TableHead>
                            <TableHead className="w-28 text-gray-600 dark:text-gray-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mappings.map((mapping, idx) => {
                            const isEditing = editingTerm === mapping.original;

                            return (
                                <TableRow
                                    key={idx}
                                    className={cn(
                                        "cursor-pointer transition-colors",
                                        selectedMapping === mapping ? "bg-blue-50/50 dark:bg-blue-900/20" : "bg-white dark:bg-sidebar",
                                        "hover:bg-gray-50 dark:hover:bg-gray-700"
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
                                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">{mapping.original}</TableCell>
                                    <TableCell>
                                        {isEditing ? (
                                            <Input
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="h-8 max-w-[200px]"
                                                onClick={(e) => e.stopPropagation()}
                                                autoFocus
                                            />
                                        ) : (
                                            <>
                                                <span className="text-gray-900 dark:text-gray-100">{mapping.suggestedDE}</span>
                                                <span className="text-gray-400 dark:text-gray-500 ml-2">+2</span>
                                            </>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <ConfidenceBadge value={mapping.confidence} />
                                    </TableCell>
                                    <TableCell>
                                        <SourceBadge source={sources[idx % sources.length]} />
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={mapping.status as any} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {isEditing ? (
                                                <>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30" onClick={handleEditSave}>
                                                        <Save className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" onClick={handleEditCancel}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={cn(
                                                            "h-8 w-8 transition-colors",
                                                            mapping.status === "ACCEPTED" ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30" : "text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                                                        )}
                                                        onClick={(e) => handleApprove(mapping.original, e)}
                                                        disabled={mapping.status === "ACCEPTED"}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                                        onClick={(e) => handleEditStart(mapping, e)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={cn(
                                                            "h-8 w-8 transition-colors",
                                                            mapping.status === "REJECTED" ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30" : "text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                                                        )}
                                                        onClick={(e) => handleReject(mapping.original, e)}
                                                        disabled={mapping.status === "REJECTED"}
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </StyledTableContainer>


        </div>
    );
}
