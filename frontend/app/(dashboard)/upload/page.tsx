"use client"

import { useState } from "react"
import { FileUploadZone } from "@/components/file-upload-zone"
import { ProfileSelector } from "@/components/profile-selector"
import { ScanProgress } from "@/components/scan-progress"
import { UploadedFilesList } from "@/components/uploaded-files-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Play } from "lucide-react"

export type UploadedFile = {
  id: string
  name: string
  size: number
  status: "pending" | "uploading" | "complete" | "error"
  progress: number
}

export type ScanState = "idle" | "uploading" | "scanning" | "complete"

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [selectedProfile, setSelectedProfile] = useState("germany")
  const [scanState, setScanState] = useState<ScanState>("idle")

  const handleFilesAdded = (newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      status: "pending" as const,
      progress: 0,
    }))
    setFiles((prev) => [...prev, ...uploadedFiles])
  }

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleStartScan = () => {
    if (files.length === 0) return

    setScanState("uploading")
    
    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: f.progress >= 100 ? "complete" : "uploading",
          progress: Math.min(f.progress + 10, 100),
        }))
      )
    }, 200)

    setTimeout(() => {
      clearInterval(uploadInterval)
      setFiles((prev) => prev.map((f) => ({ ...f, status: "complete", progress: 100 })))
      setScanState("scanning")

      // Simulate scan completion
      setTimeout(() => {
        setScanState("complete")
      }, 3000)
    }, 2500)
  }

  const canStartScan = files.length > 0 && scanState === "idle"

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Upload & Scan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload IFC models and run validation against your selected market profile
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Upload Area */}
        <div className="space-y-6 lg:col-span-2">
          {scanState === "idle" && (
            <>
              <FileUploadZone onFilesAdded={handleFilesAdded} />
              
              {files.length > 0 && (
                <UploadedFilesList 
                  files={files} 
                  onRemove={handleRemoveFile} 
                />
              )}
            </>
          )}

          {(scanState === "uploading" || scanState === "scanning") && (
            <ScanProgress 
              state={scanState} 
              files={files}
            />
          )}

          {scanState === "complete" && (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
                  <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-foreground">Scan Complete</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your model has been validated against the Germany (BIM.DE v2.1) profile
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <Button variant="secondary" onClick={() => setScanState("idle")}>
                    Upload Another
                  </Button>
                  <Button asChild>
                    <a href="/readiness" className="flex items-center gap-2">
                      View Results
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <ProfileSelector 
            selected={selectedProfile} 
            onSelect={setSelectedProfile}
            disabled={scanState !== "idle"}
          />

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">
                Scan Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Include AI suggestions</span>
                <div className="h-5 w-9 rounded-full bg-foreground p-0.5">
                  <div className="h-4 w-4 translate-x-4 rounded-full bg-background transition-transform" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Generate BCF issues</span>
                <div className="h-5 w-9 rounded-full bg-muted p-0.5">
                  <div className="h-4 w-4 rounded-full bg-muted-foreground transition-transform" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Auto-export Fix Pack</span>
                <div className="h-5 w-9 rounded-full bg-muted p-0.5">
                  <div className="h-4 w-4 rounded-full bg-muted-foreground transition-transform" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Start Scan Button */}
          <Button 
            className="w-full gap-2" 
            size="lg"
            disabled={!canStartScan}
            onClick={handleStartScan}
          >
            <Play className="h-4 w-4" />
            Start Scan
          </Button>

          {files.length > 0 && scanState === "idle" && (
            <p className="text-center text-xs text-muted-foreground">
              {files.length} file{files.length > 1 ? "s" : ""} ready for validation
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
