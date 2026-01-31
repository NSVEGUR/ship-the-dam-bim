import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  Download, 
  FileText, 
  CheckSquare, 
  Table, 
  MessageSquare,
  BookOpen,
  Sparkles,
  Clock,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

const fixPacks = [
  {
    id: "fp-001",
    version: "v23.1",
    model: "Office_Tower_Arch_v23.ifc",
    createdAt: "Jan 28, 2026 14:35",
    issues: 85,
    aiSuggestions: 3,
    status: "current",
  },
  {
    id: "fp-002",
    version: "v22.2",
    model: "Office_Tower_Arch_v22.ifc",
    createdAt: "Jan 26, 2026 09:20",
    issues: 142,
    aiSuggestions: 5,
    status: "archived",
  },
  {
    id: "fp-003",
    version: "v22.1",
    model: "Office_Tower_Arch_v22.ifc",
    createdAt: "Jan 24, 2026 16:10",
    issues: 156,
    aiSuggestions: 4,
    status: "archived",
  },
]

const currentPackContents = [
  { name: "Role-based Task Checklist", icon: CheckSquare, count: "85 tasks", description: "Organized by team role" },
  { name: "Missing Data Templates", icon: Table, count: "4 CSV files", description: "Ready for data entry" },
  { name: "BCF Issues", icon: MessageSquare, count: "12 issues", description: "Critical issues only" },
  { name: "Terminology Dictionary", icon: BookOpen, count: "156 terms", description: "German translations" },
  { name: "AI Suggestions", icon: Sparkles, count: "3 suggestions", description: "Confidence-scored" },
]

export default function FixPacksPage() {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Fix Packs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Download actionable fix packages with checklists, templates, and guidance
          </p>
        </div>
      </div>

      {/* Current Fix Pack */}
      <Card className="bg-card border-border mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-foreground text-background">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Fix Pack v23.1
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Office_Tower_Arch_v23.ifc • Generated Jan 28, 2026
              </p>
            </div>
          </div>
          <Badge className="bg-success/20 text-success">Current</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5 mb-6">
            {currentPackContents.map((item) => (
              <div 
                key={item.name}
                className="rounded-md border border-border bg-background p-3"
              >
                <div className="flex items-center gap-2 text-foreground mb-2">
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <p className="text-lg font-bold text-foreground">{item.count}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Download Full Pack
            </Button>
            <Button variant="secondary" className="gap-2">
              <FileText className="h-4 w-4" />
              Download Checklist Only
            </Button>
            <Button variant="secondary" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Export BCF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pack Contents Detail */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Task Checklist Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md bg-secondary p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">BIM Coordinator Tasks (34)</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <div className="h-4 w-4 rounded border border-border" />
                  <span>Apply Pset_WallCommon to 23 wall elements</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <div className="h-4 w-4 rounded border border-border" />
                  <span>Update classification references to DIN 276</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <div className="h-4 w-4 rounded border border-border" />
                  <span>Add fire rating to 12 door elements</span>
                </div>
              </div>
            </div>
            <div className="rounded-md bg-secondary p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Architect Tasks (28)</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <div className="h-4 w-4 rounded border border-border" />
                  <span>Rename 45 elements to follow naming convention</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <div className="h-4 w-4 rounded border border-border" />
                  <span>Complete room data for 18 IfcSpace elements</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full gap-1">
              View Full Checklist
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-info" />
              AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-info/20 bg-info/10 p-3">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-foreground">Batch property application</h4>
                <Badge variant="secondary" className="text-xs">92% confidence</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Automatically apply Pset_WallCommon to 23 walls based on geometry analysis.
              </p>
              <p className="text-xs text-success">Would resolve 23 critical issues</p>
            </div>
            <div className="rounded-md border border-info/20 bg-info/10 p-3">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-foreground">Naming convention fix</h4>
                <Badge variant="secondary" className="text-xs">88% confidence</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Batch rename elements from WALL_### to A-ARC-WALL-### pattern.
              </p>
              <p className="text-xs text-success">Would resolve 45 warning issues</p>
            </div>
            <div className="rounded-md border border-info/20 bg-info/10 p-3">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-foreground">Classification mapping</h4>
                <Badge variant="secondary" className="text-xs">76% confidence</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Map OmniClass to DIN 276 using standard mapping table.
              </p>
              <p className="text-xs text-success">Would resolve 1 critical issue</p>
            </div>
            <p className="text-center text-xs text-muted-foreground pt-2">
              AI suggestions require manual review before application
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Previous Fix Packs */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Previous Fix Packs</h2>
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Version
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Model
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Issues
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {fixPacks.map((pack) => (
                <tr key={pack.id} className="group hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{pack.version}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">{pack.model}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-foreground">{pack.issues}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">{pack.createdAt}</span>
                  </td>
                  <td className="px-4 py-3">
                    {pack.status === "current" ? (
                      <Badge className="bg-success/20 text-success">Current</Badge>
                    ) : (
                      <Badge variant="secondary">Archived</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="gap-1 opacity-0 group-hover:opacity-100">
                      <Download className="h-4 w-4" />
                      Download
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
