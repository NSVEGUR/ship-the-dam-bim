"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, ChevronDown, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const profiles = [
    { id: "ifc-basic", name: "IFC Basic" },
    { id: "ifc-advanced", name: "IFC Advanced" },
    { id: "custom", name: "Custom Profile" },
];

export function FileUploadPanel() {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                setUploadedFile(file.name);
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
            setUploadedFile(files[0].name);
            console.log("Selected file:", files[0].name);
        }
    };

    return (
        <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-0 pt-3 px-4">
                <CardTitle className="text-sm font-medium text-gray-900">Quick Action</CardTitle>
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
                        className={`
              w-32 border-2 border-dashed rounded-lg p-3 text-center cursor-pointer
              transition-colors flex flex-col items-center justify-center min-h-[120px]
              ${uploadedFile
                                ? "border-emerald-400 bg-emerald-50"
                                : isDragging
                                    ? "border-emerald-400 bg-emerald-50"
                                    : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                            }
            `}
                    >
                        {uploadedFile ? (
                            <>
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mb-1.5">
                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                </div>
                                <span className="text-xs font-medium text-emerald-700 truncate max-w-full px-1">
                                    {uploadedFile}
                                </span>
                                <span className="text-[10px] text-emerald-600">Uploaded</span>
                            </>
                        ) : (
                            <>
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mb-1.5">
                                    <Upload className="h-4 w-4 text-gray-500" />
                                </div>
                                <span className="text-xs font-medium text-gray-700">Drop file here</span>
                                <span className="text-[10px] text-gray-500">or click to browse</span>
                            </>
                        )}
                    </div>

                    {/* Right column: Action buttons */}
                    <div className="flex-1 flex flex-col gap-2">
                        {/* Profile Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="justify-between gap-2 h-9 border-gray-200"
                                >
                                    {selectedProfile
                                        ? profiles.find(p => p.id === selectedProfile)?.name
                                        : "Choose Profile"}
                                    <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                                {profiles.map((profile) => (
                                    <DropdownMenuItem
                                        key={profile.id}
                                        onClick={() => setSelectedProfile(profile.id)}
                                        className={cn(
                                            selectedProfile === profile.id && "bg-emerald-50 text-emerald-700"
                                        )}
                                    >
                                        {profile.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {/* Scan button - primary */}
                        <Button
                            size="sm"
                            className="h-9 bg-gray-900 hover:bg-gray-800 text-white"
                        >
                            Scan
                        </Button>
                        {/* Download button - secondary */}
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 border-gray-200"
                        >
                            Download
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
