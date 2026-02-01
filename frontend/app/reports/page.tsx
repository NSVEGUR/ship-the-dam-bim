"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";
import { Loader2, ArrowRight, FileText, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProject } from "@/components/ProjectContext";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Report {
    id: string;
    created_at: string;
    project_id: string;
    content: any;
    projects?: {
        project_name: string;
    };
}

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { setCurrentProject } = useProject();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                // Fetch reports and join with projects table to get project name
                const { data, error } = await supabase
                    .from('reports')
                    .select('*, projects(project_name)')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                setReports(data || []);
            } catch (error) {
                console.error("Error fetching reports:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReports();
    }, []);

    const handleViewReport = (report: Report) => {
        // Set context and navigate
        setCurrentProject(report.project_id);
        router.push("/readiness-report");
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getScore = (report: Report) => {
        try {
            const content = typeof report.content === 'string'
                ? JSON.parse(report.content)
                : report.content;

            // Try to find score in different possible locations based on schema evolution
            if (content?.overall_readiness !== undefined) return Math.round(content.overall_readiness * 100);
            if (content?.scores?.overall_readiness !== undefined) return Math.round(content.scores.overall_readiness * 100);

            return 0;
        } catch (e) {
            return 0;
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports</h1>
                    <p className="text-gray-500 dark:text-gray-400">Archive of all generated readiness reports</p>
                </div>

                <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-card">
                    <CardHeader>
                        <CardTitle>Recent Reports</CardTitle>
                        <CardDescription>History of readiness scans across all projects</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No reports found.</p>
                            </div>
                        ) : (
                            <div className="rounded-md border border-gray-100 dark:border-gray-800 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gray-50 dark:bg-sidebar">
                                        <TableRow>
                                            <TableHead className="w-[200px]">Date</TableHead>
                                            <TableHead>Project</TableHead>
                                            <TableHead>Readiness Score</TableHead>
                                            <TableHead>Content</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reports.map((report) => (
                                            <TableRow key={report.id} className="hover:bg-gray-50 dark:hover:bg-sidebar/50 transition-colors">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        {formatDate(report.created_at)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                                                        {report.projects?.project_name || "Unknown Project"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className={
                                                            getScore(report) >= 90
                                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                                : getScore(report) >= 70
                                                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                        }
                                                    >
                                                        {getScore(report)}%
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-[500px]">
                                                    <pre className="text-[10px] leading-tight font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-800 overflow-auto max-h-[120px] whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                                                        {typeof report.content === 'string'
                                                            ? report.content
                                                            : JSON.stringify(report.content, null, 2)
                                                        }
                                                    </pre>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
