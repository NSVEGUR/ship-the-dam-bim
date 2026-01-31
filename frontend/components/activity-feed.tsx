import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle, AlertCircle, Upload, Users } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "scan",
    message: "Scan completed for Office_Tower_Arch_v23.ifc",
    time: "2 hours ago",
    icon: CheckCircle,
    iconColor: "text-success",
  },
  {
    id: 2,
    type: "upload",
    message: "New model uploaded by Anna Schmidt",
    time: "3 hours ago",
    icon: Upload,
    iconColor: "text-info",
  },
  {
    id: 3,
    type: "issue",
    message: "12 critical issues flagged",
    time: "3 hours ago",
    icon: AlertCircle,
    iconColor: "text-destructive",
  },
  {
    id: 4,
    type: "fixpack",
    message: "Fix Pack v23.1 downloaded",
    time: "5 hours ago",
    icon: FileText,
    iconColor: "text-muted-foreground",
  },
  {
    id: 5,
    type: "team",
    message: "Thomas Mueller joined the project",
    time: "1 day ago",
    icon: Users,
    iconColor: "text-info",
  },
]

export function ActivityFeed() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex gap-3">
              <div className="relative">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-secondary`}>
                  <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                </div>
                {index < activities.length - 1 && (
                  <div className="absolute left-4 top-8 h-full w-px bg-border" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className="text-sm text-foreground">{activity.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
