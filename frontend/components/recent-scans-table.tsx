import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, MoreHorizontal } from "lucide-react"
import Link from "next/link"

const scans = [
  {
    id: "scan-001",
    model: "Office_Tower_Arch_v23.ifc",
    score: 73,
    issues: 85,
    profile: "Germany",
    date: "Jan 28, 2026 14:32",
    status: "completed",
  },
  {
    id: "scan-002",
    model: "Office_Tower_Arch_v22.ifc",
    score: 58,
    issues: 142,
    profile: "Germany",
    date: "Jan 26, 2026 09:15",
    status: "completed",
  },
  {
    id: "scan-003",
    model: "Office_Tower_Struct_v12.ifc",
    score: 89,
    issues: 23,
    profile: "Germany",
    date: "Jan 25, 2026 16:45",
    status: "completed",
  },
  {
    id: "scan-004",
    model: "Office_Tower_MEP_v08.ifc",
    score: 45,
    issues: 198,
    profile: "Germany",
    date: "Jan 24, 2026 11:20",
    status: "completed",
  },
]

function getScoreColor(score: number) {
  if (score >= 80) return "text-success"
  if (score >= 60) return "text-warning"
  return "text-destructive"
}

function getScoreBadgeVariant(score: number): "default" | "secondary" | "destructive" {
  if (score >= 80) return "default"
  if (score >= 60) return "secondary"
  return "destructive"
}

export function RecentScansTable() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-foreground">
          Recent Scans
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/scans">View all scans</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Model
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Score
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Issues
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Profile
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Date
                </th>
                <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {scans.map((scan) => (
                <tr key={scan.id} className="group">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-secondary">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {scan.model}
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge 
                      variant={getScoreBadgeVariant(scan.score)}
                      className={`font-mono ${scan.score >= 80 ? 'bg-success/20 text-success hover:bg-success/30' : ''}`}
                    >
                      {scan.score}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <span className={`text-sm ${getScoreColor(100 - scan.issues)}`}>
                      {scan.issues}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-sm text-muted-foreground">{scan.profile}</span>
                  </td>
                  <td className="py-3">
                    <span className="text-sm text-muted-foreground">{scan.date}</span>
                  </td>
                  <td className="py-3 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
