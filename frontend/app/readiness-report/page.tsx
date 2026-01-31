"use client";

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
    const { currentProject } = useProject();
    const { stats } = currentProject;
    const isReady = stats.readinessScore >= 95;

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Readiness Report</h1>
                        <p className="text-gray-500">
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
                                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                                <DropdownMenuItem>Export as Excel</DropdownMenuItem>
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
