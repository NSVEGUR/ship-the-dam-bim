"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, ChevronDown, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScanningOverlay } from "@/components/ui/ScanningOverlay";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(supabaseUrl, supabaseKey);

import { cn } from "@/lib/utils";
import { useProject } from "@/components/ProjectContext";


export function FileUploadPanel() {
    const router = useRouter();
    const [isDragging, setIsDragging] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const [isScanning, setIsScanning] = useState(false);
    const [llmProvider, setLlmProvider] = useState<string>("gemini");
    const [profiles, setProfiles] = useState<{ id: string; name: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { currentProject, updateProjectStats } = useProject();

    useEffect(() => {
        const fetchProfiles = async () => {
            console.log("Fetching profiles from Supabase...");
            console.log("Supabase URL:", supabaseUrl);

            const { data, error } = await supabase
                .from('profiles')
                .select('*');

            console.log("Supabase response:", { data, error });

            if (data) {
                const mappedProfiles = data.map((p: any) => ({
                    id: p.profile_id || p.id,
                    name: p.profile_id || p.name || "Unknown Profile"
                }));
                console.log("Mapped profiles:", mappedProfiles);
                setProfiles(mappedProfiles);
            }
            if (error) {
                console.error("Error fetching profiles:", error);
            }
        };

        fetchProfiles();
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (ext === 'ifc' || ext === 'csv') {
                setUploadedFile(file);
                console.log("Dropped file:", file.name);
            } else {
                alert("Please upload only .ifc or .csv files");
            }
        }
    }, []);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setUploadedFile(files[0]);
            console.log("Selected file:", files[0].name);
        }
    };

    const handleScan = async () => {
        if (!uploadedFile) {
            return;
        }

        setIsScanning(true);
        try {
            const formData = new FormData();
            formData.append("file", uploadedFile);
            formData.append("project_id", currentProject.id);
            formData.append("profile_id", selectedProfile || "default_safety");
            formData.append("llm_provider", llmProvider);

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${apiUrl}/scan`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Scan failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const result = await response.json();
            console.log("Scan Result:", result);

            if (result.scores) {
                updateProjectStats(
                    currentProject.id,
                    result.scores,
                    result.issue_summaries || [],
                    result.missing_properties || [],
                    result.terminology_mappings || []
                );
            }

            // Redirect to readiness report page after successful scan
            router.push("/readiness-report");
        } catch (error) {
            console.error("Scan Error:", error);
            alert("Scan error occurred. Check console for details.");
            setIsScanning(false);
        }
    };

    return (
        <>
            <ScanningOverlay isVisible={isScanning} />
            <Card className="bg-white dark:bg-card border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-0 pt-3 px-4">
                    <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Quick Action</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1">
                    <div className="flex gap-3">
                        {/* Hidden file input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".ifc,.csv"
                        />
                        {/* Left column: Upload area */}
                        <div
                            onClick={handleClick}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={cn(
                                "w-32 border-2 border-dashed rounded-lg p-3 text-center cursor-pointer",
                                "transition-colors flex flex-col items-center justify-center min-h-[120px]",
                                uploadedFile
                                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30"
                                    : isDragging
                                        ? "border-primary bg-primary/10"
                                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                            )}
                        >
                            {uploadedFile ? (
                                <>
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-1.5">
                                        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 truncate max-w-full px-1">
                                        {uploadedFile.name}
                                    </span>
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-500">Uploaded</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mb-1.5">
                                        <Upload className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Drop file here</span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400">or click to browse</span>
                                </>
                            )}
                        </div>

                        {/* Right column: Action buttons */}
                        <div className="flex-1 flex flex-col gap-2">
                            <div className="flex gap-2">
                                {/* Profile Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="justify-between gap-2 h-9 border-gray-200 dark:border-gray-600 flex-1"
                                        >
                                            <span className="truncate">
                                                {selectedProfile
                                                    ? profiles.find(p => p.id === selectedProfile)?.name
                                                    : "Choose Profile"}
                                            </span>
                                            <ChevronDown className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 shrink-0" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-48">
                                        {profiles.map((profile) => (
                                            <DropdownMenuItem
                                                key={profile.id}
                                                onClick={() => setSelectedProfile(profile.id)}
                                                className={cn(
                                                    selectedProfile === profile.id && "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                                )}
                                            >
                                                {profile.name}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* LLM Provider Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="justify-between gap-2 h-9 border-gray-200 dark:border-gray-600 w-32"
                                        >
                                            <span className="capitalize">{llmProvider}</span>
                                            <ChevronDown className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-32">
                                        {["gemini", "minimax", "openai"].map((provider) => (
                                            <DropdownMenuItem
                                                key={provider}
                                                onClick={() => setLlmProvider(provider)}
                                                className={cn(
                                                    llmProvider === provider && "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
                                                    "capitalize"
                                                )}
                                            >
                                                {provider}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Scan button - primary */}
                            <Button
                                size="sm"
                                className="h-9 bg-gray-900 dark:bg-[#F09362] hover:bg-gray-800 dark:hover:bg-[#F09362]/90 text-white dark:text-gray-900"
                                onClick={handleScan}
                                disabled={isScanning || !uploadedFile}
                            >
                                Scan
                            </Button>
                            {/* Download button - secondary */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 border-gray-200 dark:border-gray-600"
                            >
                                Download
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
