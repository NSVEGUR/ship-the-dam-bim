"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  Lightbulb
} from "lucide-react"
import { cn } from "@/lib/utils"

type Issue = {
  id: string
  title: string
  description: string
  severity: "critical" | "warning" | "info"
  category: string
  element?: string
  guidance?: string
  aiSuggestion?: string
}

const issues: Issue[] = [
  {
    id: "1",
    title: "Missing Pset_WallCommon on 23 walls",
    description: "Required property set Pset_WallCommon is not applied to wall elements in Level 3 and Level 4.",
    severity: "critical",
    category: "Property Sets",
    element: "IfcWall",
    guidance: "Apply Pset_WallCommon to all IfcWall entities. Required properties: Reference, LoadBearing, IsExternal.",
    aiSuggestion: "Based on the wall geometry and placement, 18 of these walls appear to be load-bearing exterior walls. Consider batch-applying Pset_WallCommon with IsExternal=TRUE and LoadBearing=TRUE."
  },
  {
    id: "2",
    title: "Invalid IFC classification reference",
    description: "Classification system 'OmniClass' is not recognized in the Germany market profile.",
    severity: "critical",
    category: "Object Classification",
    guidance: "Use DIN 276 or Uniclass 2015 classification systems for Germany submissions.",
  },
  {
    id: "3",
    title: "Non-standard element naming",
    description: "45 elements use naming patterns that don't match the BIM.DE naming convention.",
    severity: "warning",
    category: "Naming Conventions",
    element: "Multiple",
    guidance: "Follow the pattern: [Phase]-[Discipline]-[Type]-[ID]. Example: A-ARC-WALL-001",
    aiSuggestion: "Detected naming pattern 'WALL_###'. This can be automatically converted to 'A-ARC-WALL-###' to match requirements."
  },
  {
    id: "4",
    title: "Missing fire rating property",
    description: "Fire rating not specified for 12 door elements.",
    severity: "warning",
    category: "Property Sets",
    element: "IfcDoor",
  },
  {
    id: "5",
    title: "Low geometry precision on stairs",
    description: "Stair geometry uses tessellation below recommended precision (LOD 300 required).",
    severity: "info",
    category: "Level of Detail",
    element: "IfcStair",
  },
]

function getSeverityIcon(severity: string) {
  switch (severity) {
    case "critical":
      return <AlertCircle className="h-4 w-4 text-destructive" />
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-warning" />
    case "info":
      return <Info className="h-4 w-4 text-info" />
    default:
      return null
  }
}

function getSeverityBadge(severity: string) {
  switch (severity) {
    case "critical":
      return <Badge variant="destructive" className="bg-destructive/20 text-destructive">Critical</Badge>
    case "warning":
      return <Badge className="bg-warning/20 text-warning">Warning</Badge>
    case "info":
      return <Badge variant="secondary">Info</Badge>
    default:
      return null
  }
}

export function RequirementsList() {
  const [expandedId, setExpandedId] = useState<string | null>("1")
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "info">("all")

  const filteredIssues = filter === "all" 
    ? issues 
    : issues.filter(i => i.severity === filter)

  const criticalCount = issues.filter(i => i.severity === "critical").length
  const warningCount = issues.filter(i => i.severity === "warning").length
  const infoCount = issues.filter(i => i.severity === "info").length

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-foreground">
          Issues & Guidance
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant={filter === "all" ? "secondary" : "ghost"} 
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({issues.length})
          </Button>
          <Button 
            variant={filter === "critical" ? "secondary" : "ghost"} 
            size="sm"
            onClick={() => setFilter("critical")}
            className="text-destructive"
          >
            Critical ({criticalCount})
          </Button>
          <Button 
            variant={filter === "warning" ? "secondary" : "ghost"} 
            size="sm"
            onClick={() => setFilter("warning")}
            className="text-warning"
          >
            Warning ({warningCount})
          </Button>
          <Button 
            variant={filter === "info" ? "secondary" : "ghost"} 
            size="sm"
            onClick={() => setFilter("info")}
          >
            Info ({infoCount})
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {filteredIssues.map((issue) => {
          const isExpanded = expandedId === issue.id
          
          return (
            <div 
              key={issue.id}
              className="rounded-md border border-border bg-background overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
              >
                {getSeverityIcon(issue.severity)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{issue.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{issue.category}</p>
                </div>
                {getSeverityBadge(issue.severity)}
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-border px-4 py-4 space-y-4">
                  <p className="text-sm text-muted-foreground">{issue.description}</p>
                  
                  {issue.element && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Affected element:</span>
                      <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-foreground">
                        {issue.element}
                      </code>
                    </div>
                  )}

                  {issue.guidance && (
                    <div className="rounded-md bg-secondary p-3">
                      <div className="flex items-start gap-2">
                        <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Guidance</p>
                          <p className="text-sm text-foreground">{issue.guidance}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {issue.aiSuggestion && (
                    <div className="rounded-md bg-info/10 border border-info/20 p-3">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-info mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-info mb-1">AI Suggestion</p>
                          <p className="text-sm text-foreground">{issue.aiSuggestion}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="secondary" size="sm">
                      Add to Fix Pack
                    </Button>
                    <Button variant="ghost" size="sm">
                      Mark as Resolved
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
