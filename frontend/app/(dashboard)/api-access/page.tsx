"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  Activity
} from "lucide-react"

const apiTokens = [
  {
    id: "1",
    name: "Production API",
    prefix: "dlvops_prod_",
    lastUsed: "2 hours ago",
    created: "Jan 15, 2026",
    scopes: ["read", "write", "scan"],
  },
  {
    id: "2",
    name: "CI/CD Pipeline",
    prefix: "dlvops_ci_",
    lastUsed: "1 day ago",
    created: "Jan 10, 2026",
    scopes: ["read", "scan"],
  },
]

const recentApiCalls = [
  { endpoint: "POST /api/v1/scans", status: 200, time: "2 hours ago", duration: "2.3s" },
  { endpoint: "GET /api/v1/projects/123/readiness", status: 200, time: "2 hours ago", duration: "145ms" },
  { endpoint: "GET /api/v1/fixpacks/latest", status: 200, time: "3 hours ago", duration: "89ms" },
  { endpoint: "POST /api/v1/models/upload", status: 200, time: "3 hours ago", duration: "4.2s" },
  { endpoint: "GET /api/v1/glossary/terms", status: 200, time: "5 hours ago", duration: "234ms" },
]

const apiEndpoints = [
  { method: "POST", path: "/api/v1/projects", description: "Create a new project" },
  { method: "POST", path: "/api/v1/models/upload", description: "Upload a model file" },
  { method: "POST", path: "/api/v1/scans", description: "Execute a validation scan" },
  { method: "GET", path: "/api/v1/projects/{id}/readiness", description: "Get readiness score" },
  { method: "GET", path: "/api/v1/scans/{id}/issues", description: "Get scan issues" },
  { method: "GET", path: "/api/v1/fixpacks/{id}", description: "Get fix pack details" },
  { method: "GET", path: "/api/v1/glossary/terms", description: "Query glossary terms" },
  { method: "POST", path: "/api/v1/scans/{id}/rescan", description: "Re-run a scan" },
]

export default function ApiAccessPage() {
  const [showToken, setShowToken] = useState<string | null>(null)

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">API Access</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage API tokens and explore available endpoints
          </p>
        </div>
        <Button className="gap-2">
          <ExternalLink className="h-4 w-4" />
          API Documentation
        </Button>
      </div>

      {/* API Tokens */}
      <Card className="bg-card border-border mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            API Tokens
          </CardTitle>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Token
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {apiTokens.map((token) => (
            <div 
              key={token.id}
              className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-3"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
                  <Key className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{token.name}</p>
                    <div className="flex gap-1">
                      {token.scopes.map((scope) => (
                        <Badge key={scope} variant="secondary" className="text-xs">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <code className="text-xs text-muted-foreground font-mono">
                      {showToken === token.id ? `${token.prefix}xxxxxxxxxxxx` : `${token.prefix}••••••••••••`}
                    </code>
                    <span className="text-xs text-muted-foreground">
                      Last used: {token.lastUsed}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setShowToken(showToken === token.id ? null : token.id)}
                >
                  {showToken === token.id ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent API Activity */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-semibold text-foreground">
              Recent API Calls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentApiCalls.map((call, index) => (
              <div 
                key={index}
                className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={call.status === 200 ? "default" : "destructive"}
                    className={call.status === 200 ? "bg-success/20 text-success" : ""}
                  >
                    {call.status}
                  </Badge>
                  <code className="text-xs text-foreground font-mono">{call.endpoint}</code>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{call.duration}</span>
                  <span>{call.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Available Endpoints */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Available Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {apiEndpoints.map((endpoint, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 rounded-md bg-secondary/50 px-3 py-2"
              >
                <Badge 
                  variant="secondary" 
                  className={`font-mono text-xs ${
                    endpoint.method === "POST" 
                      ? "bg-info/20 text-info" 
                      : "bg-success/20 text-success"
                  }`}
                >
                  {endpoint.method}
                </Badge>
                <div className="flex-1 min-w-0">
                  <code className="text-xs text-foreground font-mono">{endpoint.path}</code>
                  <p className="text-xs text-muted-foreground mt-0.5">{endpoint.description}</p>
                </div>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full mt-2 gap-1">
              View Full API Reference
              <ExternalLink className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* API Info */}
      <Card className="bg-secondary/50 border-border mt-6">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">API-First Design</p>
              <p className="text-sm text-muted-foreground mt-1">
                All DeliverableOps functionality is available via API. Endpoints are project-scoped, 
                profile-aware, and fully auditable. Use webhooks for real-time notifications.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
