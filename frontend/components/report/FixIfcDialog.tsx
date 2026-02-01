"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileCode, CheckCircle, AlertCircle } from "lucide-react";
import { useProject } from "@/components/ProjectContext";
import { ScanningOverlay } from "@/components/ui/ScanningOverlay";
import { cn } from "@/lib/utils";

interface FixIfcDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function FixIfcDialog({ open, onOpenChange }: FixIfcDialogProps) {
    const { currentProject } = useProject();
    const [file, setFile] = useState<File | null>(null);
    const [isFixing, setIsFixing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.toLowerCase().endsWith(".ifc")) {
                setFile(droppedFile);
                setError(null);
            } else {
                setError("Please upload a valid .ifc file");
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleFix = async () => {
        if (!file) return;

        setIsFixing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("project_id", currentProject.id);

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${apiUrl}/fix`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Fix failed: ${response.status} - ${errorText}`);
            }

            // Handle file download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            // Generate filename based on original or default
            const originalName = file.name.replace(".ifc", "");
            a.download = `${originalName}_fixed.ifc`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Close dialog after success (optional: keep open to show success message?)
            // For now, let's close it and stop loading
            onOpenChange(false);
            setFile(null); // Reset
        } catch (err: any) {
            console.error("Error fixing IFC:", err);
            setError(err.message || "An error occurred while fixing the IFC file.");
        } finally {
            setIsFixing(false);
        }
    };

    return (
        <>
            <ScanningOverlay isVisible={isFixing} />

            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-card border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-gray-100">Fix IFC File</DialogTitle>
                        <DialogDescription className="text-gray-500 dark:text-gray-400">
                            Upload your IFC file to apply automated fixes based on the latest readiness report.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={cn(
                                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[160px]",
                                file
                                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                                    : isDragging
                                        ? "border-primary bg-primary/10"
                                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                            )}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".ifc"
                            />

                            {file ? (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-3">
                                        <FileCode className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 truncate max-w-full px-4">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mt-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-auto py-1 px-2 text-xs"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                                        <Upload className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        IFC files only (max 500MB)
                                    </p>
                                </>
                            )}
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-gray-200 dark:border-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleFix}
                            disabled={!file || isFixing}
                            className="bg-primary hover:bg-orange-500 text-black font-medium"
                        >
                            {isFixing ? "Fixing..." : "Fix & Download"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
