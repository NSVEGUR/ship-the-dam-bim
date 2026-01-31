"use client"

import React from "react"

import { useCallback, useState } from "react"
import { Card } from "@/components/ui/card"
import { Upload, FileText } from "lucide-react"

type FileUploadZoneProps = {
  onFilesAdded: (files: File[]) => void
}

export function FileUploadZone({ onFilesAdded }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      
      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        (file) => file.name.endsWith(".ifc") || file.name.endsWith(".csv")
      )
      
      if (droppedFiles.length > 0) {
        onFilesAdded(droppedFiles)
      }
    },
    [onFilesAdded]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files
      if (selectedFiles) {
        onFilesAdded(Array.from(selectedFiles))
      }
      e.target.value = ""
    },
    [onFilesAdded]
  )

  return (
    <Card
      className={`relative border-2 border-dashed transition-colors ${
        isDragging
          ? "border-foreground bg-secondary/50"
          : "border-border bg-card hover:border-muted-foreground"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label className="flex cursor-pointer flex-col items-center justify-center px-6 py-16">
        <input
          type="file"
          className="sr-only"
          accept=".ifc,.csv"
          multiple
          onChange={handleFileInput}
        />
        
        <div className={`mb-4 rounded-full p-4 transition-colors ${
          isDragging ? "bg-foreground text-background" : "bg-secondary text-foreground"
        }`}>
          <Upload className="h-8 w-8" />
        </div>
        
        <h3 className="text-lg font-semibold text-foreground">
          Drop your IFC files here
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          or click to browse from your computer
        </p>

        <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            <span>IFC 2x3, IFC 4</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            <span>Schedule CSV</span>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Maximum file size: 500MB
        </p>
      </label>
    </Card>
  )
}
