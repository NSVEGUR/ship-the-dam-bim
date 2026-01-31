"use client";

import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProject } from "@/components/ProjectContext";
import { NewProjectDialog } from "@/components/NewProjectDialog";
import { cn } from "@/lib/utils";
import { ChevronDown, Plus } from "lucide-react";
import {
  ReadinessScoreCard,
  IssuesSummaryCard,
  ProjectInfoBar,
  FileUploadPanel,
  ValidationCategoriesCards,
} from "@/components/dashboard";

export default function DashboardPage() {
  const { currentProject, projects, setCurrentProject } = useProject();
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const isReadyToShip = currentProject.stats.readinessScore >= 95;

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header with Project selector and Ready to Ship badge */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-500">Overview of BIM Readiness Status</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Project Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-gray-200 h-8">
                  {currentProject.name}
                  <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {projects.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => setCurrentProject(project.id)}
                    className={cn(
                      currentProject.id === project.id && "bg-emerald-50 text-emerald-700"
                    )}
                  >
                    {project.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* New Project Button */}
            <Button
              variant="outline"
              size="icon"
              className="border-gray-200 h-8 w-8"
              onClick={() => setNewProjectOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
            {/* Ready to Ship Badge */}
            <Badge
              variant="secondary"
              className={cn(
                "gap-1 px-2 py-1 text-xs",
                isReadyToShip
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              )}
            >
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                isReadyToShip ? "bg-emerald-500" : "bg-amber-500"
              )} />
              {isReadyToShip ? "Ready to Ship" : "Not Ready"}
            </Badge>
          </div>
        </div>

        {/* Project Info Bar - full width at top */}
        <ProjectInfoBar />

        {/* Top row: File Upload (left) | Readiness Score (right) */}
        <div className="grid grid-cols-2 gap-4">
          <FileUploadPanel />
          <ReadinessScoreCard />
        </div>

        {/* Bottom row: Issue Summary (left) | Validation Categories (right) */}
        <div className="grid grid-cols-2 gap-4 items-stretch">
          <IssuesSummaryCard />
          <ValidationCategoriesCards />
        </div>
      </div>

      {/* New Project Dialog */}
      <NewProjectDialog open={newProjectOpen} onOpenChange={setNewProjectOpen} />
    </MainLayout>
  );
}
