import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, RefreshCw, Download, Send } from "lucide-react"
import Link from "next/link"

const actions = [
  {
    name: "Upload Model",
    description: "Add a new IFC file",
    icon: Upload,
    href: "/upload",
    variant: "default" as const,
  },
  {
    name: "Re-scan Latest",
    description: "Run validation again",
    icon: RefreshCw,
    href: "#",
    variant: "secondary" as const,
  },
  {
    name: "Export Fix Pack",
    description: "Download checklist & data",
    icon: Download,
    href: "/fix-packs",
    variant: "secondary" as const,
  },
  {
    name: "Submit to CDE",
    description: "Push to external system",
    icon: Send,
    href: "#",
    variant: "secondary" as const,
  },
]

export function QuickActions() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Button
            key={action.name}
            variant={action.variant}
            className="w-full justify-start gap-3 h-auto py-3"
            asChild
          >
            <Link href={action.href}>
              <action.icon className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">{action.name}</div>
                <div className="text-xs text-muted-foreground font-normal">
                  {action.description}
                </div>
              </div>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
