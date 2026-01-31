import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plug, 
  Check, 
  ExternalLink, 
  Settings,
  RefreshCw,
  ArrowRight
} from "lucide-react"

const integrations = [
  {
    id: "bimcollab",
    name: "BIMcollab",
    description: "Sync BCF issues bidirectionally with BIMcollab projects",
    status: "connected",
    lastSync: "2 hours ago",
    logo: "BC",
  },
  {
    id: "solibri",
    name: "Solibri",
    description: "Import validation results and export fix packs",
    status: "available",
    lastSync: null,
    logo: "S",
  },
  {
    id: "acc",
    name: "Autodesk Construction Cloud",
    description: "Push validated models and issues to ACC projects",
    status: "available",
    lastSync: null,
    logo: "A",
  },
  {
    id: "bcf",
    name: "Generic BCF",
    description: "Import/export BCF 2.1 and BCF 3.0 files",
    status: "connected",
    lastSync: "1 day ago",
    logo: "BCF",
  },
]

const webhooks = [
  { event: "scan.completed", url: "https://api.example.com/webhooks/scan", status: "active" },
  { event: "fixpack.exported", url: "https://api.example.com/webhooks/fixpack", status: "active" },
]

export default function IntegrationsPage() {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Integrations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect DeliverableOps with your existing BIM ecosystem
          </p>
        </div>
      </div>

      {/* Integration Philosophy */}
      <Card className="bg-secondary/50 border-border mb-6">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Plug className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">DeliverableOps as Pre-flight Gate</p>
              <p className="text-sm text-muted-foreground mt-1">
                DeliverableOps generates structured issues and fix packs. External tools execute the fixes. 
                Results are re-ingested for validation. We never replace your existing tools.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Integrations */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Available Integrations</h2>
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        {integrations.map((integration) => (
          <Card key={integration.id} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary font-mono text-sm font-bold text-foreground">
                    {integration.logo}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{integration.name}</h3>
                    {integration.status === "connected" && (
                      <p className="text-xs text-muted-foreground">Last sync: {integration.lastSync}</p>
                    )}
                  </div>
                </div>
                {integration.status === "connected" ? (
                  <Badge className="bg-success/20 text-success gap-1">
                    <Check className="h-3 w-3" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary">Available</Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {integration.description}
              </p>

              <div className="flex items-center gap-2">
                {integration.status === "connected" ? (
                  <>
                    <Button variant="secondary" size="sm" className="gap-1">
                      <RefreshCw className="h-3 w-3" />
                      Sync Now
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Settings className="h-3 w-3" />
                      Configure
                    </Button>
                  </>
                ) : (
                  <Button size="sm" className="gap-1">
                    Connect
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Webhooks */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Webhooks</h2>
      <Card className="bg-card border-border mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Configured Webhooks
          </CardTitle>
          <Button variant="secondary" size="sm">Add Webhook</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {webhooks.map((webhook, index) => (
              <div 
                key={index}
                className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-3"
              >
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {webhook.event}
                  </Badge>
                  <code className="text-sm text-muted-foreground">{webhook.url}</code>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Flow */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Integration Data Flow</h2>
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-md bg-secondary">
                <span className="text-sm font-bold text-foreground">BIM</span>
              </div>
              <p className="text-sm font-medium text-foreground">Modeling Tools</p>
              <p className="text-xs text-muted-foreground">Revit, Archicad, etc.</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-md bg-foreground text-background">
                <span className="text-sm font-bold">D</span>
              </div>
              <p className="text-sm font-medium text-foreground">DeliverableOps</p>
              <p className="text-xs text-muted-foreground">Validate & Generate Fix Pack</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-md bg-secondary">
                <span className="text-sm font-bold text-foreground">CDE</span>
              </div>
              <p className="text-sm font-medium text-foreground">CDE / Issue Tracker</p>
              <p className="text-xs text-muted-foreground">BIMcollab, ACC, etc.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
