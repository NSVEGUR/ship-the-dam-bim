import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, AlertTriangle, Info } from "lucide-react"
import Link from "next/link"

const issues = [
  { 
    label: "Critical", 
    count: 12, 
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10"
  },
  { 
    label: "Warning", 
    count: 28, 
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10"
  },
  { 
    label: "Info", 
    count: 45, 
    icon: Info,
    color: "text-info",
    bgColor: "bg-info/10"
  },
]

export function IssuesSummaryCard() {
  const totalIssues = issues.reduce((acc, item) => acc + item.count, 0)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Issues Summary
        </CardTitle>
        <Link 
          href="/issues" 
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="text-4xl font-bold text-foreground">{totalIssues}</span>
          <span className="ml-2 text-sm text-muted-foreground">total issues</span>
        </div>

        <div className="space-y-3">
          {issues.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-md p-1.5 ${item.bgColor}`}>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <span className="text-sm text-foreground">{item.label}</span>
              </div>
              <span className="text-sm font-medium text-foreground">{item.count}</span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-muted">
          <div 
            className="bg-destructive" 
            style={{ width: `${(issues[0].count / totalIssues) * 100}%` }} 
          />
          <div 
            className="bg-warning" 
            style={{ width: `${(issues[1].count / totalIssues) * 100}%` }} 
          />
          <div 
            className="bg-info" 
            style={{ width: `${(issues[2].count / totalIssues) * 100}%` }} 
          />
        </div>
      </CardContent>
    </Card>
  )
}
