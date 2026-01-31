import { ReadinessScoreCard } from "@/components/readiness-score-card"
import { RecentScansTable } from "@/components/recent-scans-table"
import { IssuesSummaryCard } from "@/components/issues-summary-card"
import { MarketProfileCard } from "@/components/market-profile-card"
import { QuickActions } from "@/components/quick-actions"
import { ActivityFeed } from "@/components/activity-feed"

export default function DashboardPage() {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Project Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Berlin Office Tower - Overview of model readiness and recent activity
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Top Row - Score & Issues */}
          <div className="grid gap-6 md:grid-cols-2">
            <ReadinessScoreCard />
            <IssuesSummaryCard />
          </div>

          {/* Market Profile */}
          <MarketProfileCard />

          {/* Recent Scans */}
          <RecentScansTable />
        </div>

        {/* Right Column - Actions & Activity */}
        <div className="space-y-6">
          <QuickActions />
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}
