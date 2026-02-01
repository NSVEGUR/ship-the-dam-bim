"use client";

import * as XLSX from "xlsx";
import { Check, Download, ChevronDown } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";
import { useProject } from "@/components/ProjectContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    GeneralTab,
    MissingPropertyTab,
    BCFTab,
    TerminologyTab,
} from "@/components/report";
import { ReadinessScoreHeader } from "@/components/report/ReadinessScoreHeader";

export default function ReadinessReportPage() {
    const { currentProject, saveReport } = useProject();
    const { stats } = currentProject;
    const isReady = stats.readinessScore >= 95;

    const handleExportExcel = async () => {
        try {
            // Save current state to database
            const reportData = await saveReport(currentProject.id);
            if (!reportData) return;

            // Create workbook
            const wb = XLSX.utils.book_new();

            // 1. Summary Sheet
            const summaryData = [
                { Metric: "Overall Readiness", Value: reportData.scores.overall_readiness },
                { Metric: "Object Classification", Value: reportData.scores.object_classification },
                { Metric: "Property Sets", Value: reportData.scores.property_sets },
                { Metric: "Naming Conventions", Value: reportData.scores.naming_conventions },
                { Metric: "Report Timestamp", Value: reportData.timestamp }
            ];
            const summaryWs = XLSX.utils.json_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

            // 2. Missing Properties
            if (reportData.missing_properties?.length > 0) {
                const mpWs = XLSX.utils.json_to_sheet(reportData.missing_properties);
                XLSX.utils.book_append_sheet(wb, mpWs, "Missing Properties");
            }

            // 3. Terminology Mappings
            if (reportData.terminology_mappings?.length > 0) {
                const tmWs = XLSX.utils.json_to_sheet(reportData.terminology_mappings);
                XLSX.utils.book_append_sheet(wb, tmWs, "Terminology");
            }

            // 4. Issue Summaries
            if (reportData.issue_summaries?.length > 0) {
                const isWs = XLSX.utils.json_to_sheet(reportData.issue_summaries);
                XLSX.utils.book_append_sheet(wb, isWs, "Issue Summaries");
            }

            // Download file
            const filename = `Readiness_Report_${currentProject.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, filename);

        } catch (error) {
            console.error("Failed to export Excel:", error);
            alert("Failed to export report. See console for details.");
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Readiness Report</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {currentProject.name} • Last scan: {stats.lastScan}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant={isReady ? "default" : "outline"}
                            className={isReady ? "bg-emerald-600 hover:bg-emerald-700 gap-2" : "gap-2"}
                        >
                            <Check className="h-4 w-4" />
                            READY TO SHIP
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                                    <Download className="h-4 w-4" />
                                    Export
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleExportExcel}>Export as Excel</DropdownMenuItem>
                                <DropdownMenuItem>Export as BCF</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Score and Issues Summary Cards */}
                <ReadinessScoreHeader />

                {/* Tabs */}
                <Tabs defaultValue="general" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="missing-property">Missing Property</TabsTrigger>
                        <TabsTrigger value="terminology">Terminology</TabsTrigger>
                        <TabsTrigger value="bcf">BCF</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="mt-6">
                        <GeneralTab />
                    </TabsContent>

                    <TabsContent value="missing-property" className="mt-6">
                        <MissingPropertyTab />
                    </TabsContent>

                    <TabsContent value="terminology" className="mt-6">
                        <TerminologyTab />
                    </TabsContent>

                    <TabsContent value="bcf" className="mt-6">
                        <BCFTab />
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}
