"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText, CheckCircle, Loader2 } from "lucide-react"
import type { UploadedFile, ScanState } from "@/app/(dashboard)/upload/page"

type ScanProgressProps = {
  state: ScanState
  files: UploadedFile[]
}

const scanSteps = [
  { id: "upload", name: "Uploading files" },
  { id: "parse", name: "Parsing IFC structure" },
  { id: "validate", name: "Validating requirements" },
  { id: "terminology", name: "Checking terminology" },
  { id: "generate", name: "Generating results" },
]

export function ScanProgress({ state, files }: ScanProgressProps) {
  const currentStepIndex = state === "uploading" ? 0 : state === "scanning" ? 2 : -1

  return (
    <Card className="bg-card border-border">
      <CardContent className="py-8">
        {/* File Progress */}
        {state === "uploading" && (
          <div className="mb-8 space-y-3">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {file.progress}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full bg-foreground transition-all duration-200"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scan Steps */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            {state === "uploading" ? "Uploading..." : "Scanning Model..."}
          </h3>
          
          <div className="space-y-3">
            {scanSteps.map((step, index) => {
              const isComplete = index < currentStepIndex
              const isCurrent = index === currentStepIndex
              const isPending = index > currentStepIndex

              return (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isComplete 
                      ? "bg-success/20" 
                      : isCurrent 
                        ? "bg-secondary" 
                        : "bg-muted"
                  }`}>
                    {isComplete ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 text-foreground animate-spin" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                    )}
                  </div>
                  <span className={`text-sm ${
                    isComplete 
                      ? "text-success" 
                      : isCurrent 
                        ? "text-foreground font-medium" 
                        : "text-muted-foreground"
                  }`}>
                    {step.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Estimated Time */}
        <div className="mt-8 rounded-md bg-secondary px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Estimated time remaining: <span className="text-foreground font-medium">~2 minutes</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
