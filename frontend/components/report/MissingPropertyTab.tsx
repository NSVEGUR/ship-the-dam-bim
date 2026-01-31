"use client";

import { useState } from "react";
import { XCircle, AlertTriangle } from "lucide-react";
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
import { useProject, MissingProperty } from "@/components/ProjectContext";
import { AISuggestionsPanel } from "./AISuggestionsPanel";
import { StyledTableContainer } from "./StyledTableContainer";

// Severity badge with icons
function SeverityBadge({ severity }: { severity: string }) {
    if (severity === "CRITICAL") {
        return (
            <Badge variant="secondary" className="gap-1.5 bg-red-50 text-red-700 hover:bg-red-50 border border-red-200">
                <XCircle className="h-3 w-3" />
                Critical
            </Badge>
        );
    }
    return (
        <Badge variant="secondary" className="gap-1.5 bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200">
            <AlertTriangle className="h-3 w-3" />
            Warning
        </Badge>
    );
}

// Element type badge
function ElementTypeBadge({ type }: { type: string }) {
    const colors: Record<string, string> = {
        IfcWall: "bg-blue-50 text-blue-700 border-blue-200",
        IfcDoor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        IfcWindow: "bg-violet-50 text-violet-700 border-violet-200",
        IfcSlab: "bg-amber-50 text-amber-700 border-amber-200",
        IfcSpace: "bg-pink-50 text-pink-700 border-pink-200",
    };
    return (
        <Badge variant="outline" className={cn("text-xs font-medium border", colors[type] || "bg-gray-50 text-gray-700 border-gray-200")}>
            {type}
        </Badge>
    );
}

// Mock AI suggestion
const getMockSuggestion = (prop: MissingProperty) => ({
    title: prop.ruleName,
    confidence: 82,
    whyMatters: `The ${prop.propertyKey} property in ${prop.propertySet} is essential for ${prop.elementType} elements. This property enables proper classification, scheduling, and compliance checking across the model.`,
    ifIgnored: `Missing ${prop.propertyKey} on ${prop.elementName} may cause issues in downstream applications including quantity takeoff, cost estimation, and regulatory compliance verification.`,
});

export function MissingPropertyTab() {
    const { currentProject } = useProject();
    const properties = currentProject.stats.missingProperties;
    const [selectedProperty, setSelectedProperty] = useState<MissingProperty | null>(null);

    return (
        <div className="flex gap-6">
            <StyledTableContainer className="flex-1 overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead className="w-24 text-gray-600 font-medium">Severity</TableHead>
                            <TableHead className="w-28 text-gray-600 font-medium">Issue Type</TableHead>
                            <TableHead className="w-24 text-gray-600 font-medium">Rule ID</TableHead>
                            <TableHead className="text-gray-600 font-medium">Rule Name</TableHead>
                            <TableHead className="w-28 text-gray-600 font-medium">Element Type</TableHead>
                            <TableHead className="text-gray-600 font-medium">Element Name</TableHead>
                            <TableHead className="w-16 text-gray-600 font-medium">Level</TableHead>
                            <TableHead className="text-gray-600 font-medium">Property Set</TableHead>
                            <TableHead className="text-gray-600 font-medium">Property Key</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {properties.map((prop, idx) => (
                            <TableRow
                                key={idx}
                                className={cn(
                                    "cursor-pointer transition-colors",
                                    selectedProperty === prop && "bg-blue-50/50",
                                    "hover:bg-gray-50"
                                )}
                                onClick={() => setSelectedProperty(prop)}
                            >
                                <TableCell>
                                    <SeverityBadge severity={prop.severity} />
                                </TableCell>
                                <TableCell className="text-sm text-gray-700">{prop.issueType}</TableCell>
                                <TableCell className="font-mono text-sm text-gray-600">{prop.ruleId}</TableCell>
                                <TableCell className="font-medium text-gray-900">{prop.ruleName}</TableCell>
                                <TableCell>
                                    <ElementTypeBadge type={prop.elementType} />
                                </TableCell>
                                <TableCell className="text-sm text-gray-900 max-w-40 truncate" title={prop.elementName}>
                                    {prop.elementName}
                                </TableCell>
                                <TableCell className="text-sm text-gray-600">{prop.level}</TableCell>
                                <TableCell>
                                    <span className="text-sm px-2 py-1 bg-gray-100 rounded text-gray-700">{prop.propertySet}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm font-mono text-gray-600">{prop.propertyKey}</span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </StyledTableContainer>

            {/* AI Suggestions Panel */}
            <AISuggestionsPanel
                selectedItem={selectedProperty ? { name: `${selectedProperty.elementName} - ${selectedProperty.propertyKey}` } : null}
                suggestion={selectedProperty ? getMockSuggestion(selectedProperty) : null}
                onDismiss={() => setSelectedProperty(null)}
                onAccept={() => setSelectedProperty(null)}
            />
        </div>
    );
}
