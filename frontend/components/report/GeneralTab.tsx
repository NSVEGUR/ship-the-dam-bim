"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useProject, ValidationRule } from "@/components/ProjectContext";
import { AISuggestionsPanel } from "./AISuggestionsPanel";
import { StyledTableContainer } from "./StyledTableContainer";

function SeverityBadge({ severity }: { severity: ValidationRule["severity"] }) {
    if (severity === "CRITICAL") {
        return (
            <Badge variant="secondary" className="gap-1.5 bg-red-50 text-red-700 hover:bg-red-50 border border-red-200">
                <XCircle className="h-3 w-3" />
                Critical
            </Badge>
        );
    }
    if (severity === "WARNING") {
        return (
            <Badge variant="secondary" className="gap-1.5 bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200">
                <AlertTriangle className="h-3 w-3" />
                Warning
            </Badge>
        );
    }
    return (
        <Badge variant="secondary" className="gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            OK
        </Badge>
    );
}

// Pass rate with color coding
function PassRateBadge({ value }: { value: number }) {
    const getColor = () => {
        if (value >= 95) return "text-emerald-600";
        if (value >= 80) return "text-emerald-500";
        if (value >= 60) return "text-amber-600";
        return "text-red-500";
    };
    return (
        <span className={cn("text-sm font-semibold", getColor())}>{value}%</span>
    );
}

// Mock AI suggestion - in production this would come from an API call
const getMockSuggestion = (rule: ValidationRule) => ({
    title: rule.ruleName,
    confidence: 85,
    whyMatters: `IFC classification ensures ${rule.ruleName.toLowerCase()} are correctly identified and mapped across authoring tools, coordination platforms, and downstream uses (quantities, codes, asset data). It enables consistent filtering, reporting, and rule-based checking.`,
    ifIgnored: `Unclassified elements may be misinterpreted or excluded from schedules, clash/clearance checks, QTO, and exports. This can cause missing quantities, incorrect coordination decisions, and rework due to unreliable model data.`,
});

export function GeneralTab() {
    const { currentProject } = useProject();
    const rules = currentProject.stats.validationRules;
    const [selectedRule, setSelectedRule] = useState<ValidationRule | null>(null);

    return (
        <div className="flex gap-6">
            {/* Rules Table */}
            <StyledTableContainer className="flex-1 overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead className="w-24 text-gray-600 font-medium">Rule ID</TableHead>
                            <TableHead className="text-gray-600 font-medium">Rule Name</TableHead>
                            <TableHead className="w-28 text-gray-600 font-medium">Severity</TableHead>
                            <TableHead className="text-right w-20 text-gray-600 font-medium">Checked</TableHead>
                            <TableHead className="text-right w-20 text-gray-600 font-medium">Failed</TableHead>
                            <TableHead className="text-right w-24 text-gray-600 font-medium">Pass Rate</TableHead>
                            <TableHead className="text-gray-600 font-medium">Notes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rules.map((rule) => (
                            <TableRow
                                key={rule.ruleId}
                                className={cn(
                                    "cursor-pointer transition-colors",
                                    selectedRule?.ruleId === rule.ruleId && "bg-blue-50/50",
                                    "hover:bg-gray-50"
                                )}
                                onClick={() => setSelectedRule(rule)}
                            >
                                <TableCell className="font-mono text-sm text-gray-600">{rule.ruleId}</TableCell>
                                <TableCell className="font-medium text-gray-900">{rule.ruleName}</TableCell>
                                <TableCell>
                                    <SeverityBadge severity={rule.severity} />
                                </TableCell>
                                <TableCell className="text-right text-gray-700">{rule.checked}</TableCell>
                                <TableCell className="text-right text-gray-700">{rule.failed}</TableCell>
                                <TableCell className="text-right">
                                    <PassRateBadge value={rule.passRate} />
                                </TableCell>
                                <TableCell className="text-gray-500 text-sm">{rule.notes}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </StyledTableContainer>

            {/* AI Suggestions Panel */}
            <AISuggestionsPanel
                selectedItem={selectedRule ? { name: selectedRule.ruleName } : null}
                suggestion={selectedRule ? getMockSuggestion(selectedRule) : null}
                onDismiss={() => setSelectedRule(null)}
                onAccept={() => setSelectedRule(null)}
            />
        </div>
    );
}
