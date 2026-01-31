import { ReadinessOverview } from "@/components/readiness-overview"
import { RequirementsList } from "@/components/requirements-list"
import { AISuggestionsPanel } from "@/components/ai-suggestions-panel"
import { ReadinessActions } from "@/components/readiness-actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Download } from "lucide-react"

export default function ReadinessPage() {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">Readiness Score</h1>
            <Badge variant="secondary" className="bg-warning/20 text-warning">
              Not Ready
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Office_Tower_Arch_v23.ifc • Scanned Jan 28, 2026 at 14:32
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Re-scan
          </Button>
          <Button variant="secondary" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          <ReadinessOverview />
          <RequirementsList />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <ReadinessActions />
          <AISuggestionsPanel />
        </div>
      </div>
    </div>
  )
}
