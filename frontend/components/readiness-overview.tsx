import { Card, CardContent } from "@/components/ui/card"
import { Check, X, AlertTriangle, TrendingUp } from "lucide-react"

const categories = [
  { name: "Object Classification", score: 92, status: "pass" },
  { name: "Property Sets", score: 45, status: "fail" },
  { name: "Naming Conventions", score: 78, status: "warning" },
  { name: "Geometry Validation", score: 95, status: "pass" },
  { name: "Level of Detail", score: 52, status: "fail" },
  { name: "Coordinate System", score: 100, status: "pass" },
]

function getStatusIcon(status: string) {
  switch (status) {
    case "pass":
      return <Check className="h-4 w-4 text-success" />
    case "fail":
      return <X className="h-4 w-4 text-destructive" />
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-warning" />
    default:
      return null
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "pass":
      return "bg-success"
    case "fail":
      return "bg-destructive"
    case "warning":
      return "bg-warning"
    default:
      return "bg-muted"
  }
}

export function ReadinessOverview() {
  const overallScore = 73
  const previousScore = 58

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-start gap-8">
          {/* Score Circle */}
          <div className="flex flex-col items-center">
            <div className="relative h-32 w-32">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-muted"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeDasharray={`${overallScore}, 100`}
                  className="text-warning"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground">{overallScore}</span>
                <span className="text-xs text-muted-foreground">of 100</span>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-success">
              <TrendingUp className="h-4 w-4" />
              <span>+{overallScore - previousScore} from last scan</span>
            </div>
          </div>

          {/* Categories */}
          <div className="flex-1 space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Validation Categories
            </h3>
            {categories.map((category) => (
              <div key={category.name} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary">
                  {getStatusIcon(category.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{category.name}</span>
                    <span className="text-sm font-medium text-foreground">{category.score}%</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div 
                      className={`h-full transition-all ${getStatusColor(category.status)}`}
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
