"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  Plus,
  Check,
  FolderOpen,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Demo projects - in a real app, this would come from an API/database
const initialProjects = [
  { id: "1", name: "Berlin Office Tower", status: "active" },
  { id: "2", name: "Munich Residential Complex", status: "active" },
  { id: "3", name: "Hamburg Industrial Park", status: "pending" },
]

export function ProjectSwitcher() {
  const router = useRouter()
  const [projects, setProjects] = useState(initialProjects)
  const [currentProject, setCurrentProject] = useState(projects[0])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")

  const handleSelectProject = (project: typeof projects[0]) => {
    setCurrentProject(project)
    // Navigate to dashboard when switching projects
    router.push("/dashboard")
  }

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      const newProject = {
        id: String(Date.now()),
        name: newProjectName.trim(),
        status: "active" as const,
      }
      setProjects([...projects, newProject])
      setCurrentProject(newProject)
      setNewProjectName("")
      setIsCreateDialogOpen(false)
      // Navigate to dashboard after creating project
      router.push("/dashboard")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success"
      case "pending":
        return "bg-warning"
      default:
        return "bg-muted"
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center justify-between rounded-md bg-sidebar-accent px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`h-2 w-2 rounded-full flex-shrink-0 ${getStatusColor(currentProject.status)}`} />
              <span className="truncate">{currentProject.name}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Projects
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onClick={() => handleSelectProject(project)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${getStatusColor(project.status)}`} />
                <span className="truncate">{project.name}</span>
              </div>
              {currentProject.id === project.id && (
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2 cursor-pointer text-primary"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Project</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Enter a name for your new project. You&apos;ll be redirected to the dashboard after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="e.g., Frankfurt Airport Terminal"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateProject()
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                setNewProjectName("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!newProjectName.trim()}
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
