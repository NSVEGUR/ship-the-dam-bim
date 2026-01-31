"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Search, 
  Filter,
  ChevronDown,
  Download,
  Lightbulb
} from "lucide-react"

type Issue = {
  id: string
  title: string
  severity: "critical" | "warning" | "info"
  category: string
  element: string
  count: number
  hasAISuggestion: boolean
}

const allIssues: Issue[] = [
  { id: "1", title: "Missing Pset_WallCommon", severity: "critical", category: "Property Sets", element: "IfcWall", count: 23, hasAISuggestion: true },
  { id: "2", title: "Invalid classification reference", severity: "critical", category: "Object Classification", element: "Multiple", count: 1, hasAISuggestion: true },
  { id: "3", title: "Missing structural properties", severity: "critical", category: "Property Sets", element: "IfcColumn", count: 8, hasAISuggestion: false },
  { id: "4", title: "Invalid material definition", severity: "critical", category: "Property Sets", element: "IfcSlab", count: 5, hasAISuggestion: false },
  { id: "5", title: "Non-standard element naming", severity: "warning", category: "Naming Conventions", element: "Multiple", count: 45, hasAISuggestion: true },
  { id: "6", title: "Missing fire rating property", severity: "warning", category: "Property Sets", element: "IfcDoor", count: 12, hasAISuggestion: false },
  { id: "7", title: "Incomplete room data", severity: "warning", category: "Property Sets", element: "IfcSpace", count: 18, hasAISuggestion: false },
  { id: "8", title: "Non-standard type naming", severity: "warning", category: "Naming Conventions", element: "IfcDoorType", count: 6, hasAISuggestion: false },
  { id: "9", title: "Low geometry precision on stairs", severity: "info", category: "Level of Detail", element: "IfcStair", count: 4, hasAISuggestion: false },
  { id: "10", title: "Optional property missing", severity: "info", category: "Property Sets", element: "IfcWindow", count: 32, hasAISuggestion: false },
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

export default function IssuesPage() {
  const [search, setSearch] = useState("")
  const [severityFilter, setSeverityFilter] = useState<"all" | "critical" | "warning" | "info">("all")

  const filteredIssues = allIssues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(search.toLowerCase()) ||
                          issue.category.toLowerCase().includes(search.toLowerCase()) ||
                          issue.element.toLowerCase().includes(search.toLowerCase())
    const matchesSeverity = severityFilter === "all" || issue.severity === severityFilter
    return matchesSearch && matchesSeverity
  })

  const criticalCount = allIssues.filter(i => i.severity === "critical").length
  const warningCount = allIssues.filter(i => i.severity === "warning").length
  const infoCount = allIssues.filter(i => i.severity === "info").length

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Issues</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {allIssues.length} total issues found in Office_Tower_Arch_v23.ifc
          </p>
        </div>
        <Button variant="secondary" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export All
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive/20">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{criticalCount}</p>
              <p className="text-sm text-muted-foreground">Critical Issues</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{warningCount}</p>
              <p className="text-sm text-muted-foreground">Warnings</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-info/20">
              <Info className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{infoCount}</p>
              <p className="text-sm text-muted-foreground">Info</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border mb-6">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search issues..." 
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={severityFilter === "all" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setSeverityFilter("all")}
            >
              All
            </Button>
            <Button 
              variant={severityFilter === "critical" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setSeverityFilter("critical")}
            >
              Critical
            </Button>
            <Button 
              variant={severityFilter === "warning" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setSeverityFilter("warning")}
            >
              Warning
            </Button>
            <Button 
              variant={severityFilter === "info" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setSeverityFilter("info")}
            >
              Info
            </Button>
          </div>
          <Button variant="secondary" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            More Filters
            <ChevronDown className="h-3 w-3" />
          </Button>
        </CardContent>
      </Card>

      {/* Issues Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Issue
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Element
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Count
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredIssues.map((issue) => (
                <tr key={issue.id} className="group hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {getSeverityIcon(issue.severity)}
                      <span className="text-sm font-medium text-foreground">{issue.title}</span>
                      {issue.hasAISuggestion && (
                        <Lightbulb className="h-4 w-4 text-info" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">{issue.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono text-foreground">
                      {issue.element}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{issue.count}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
