import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Building, 
  Users, 
  Shield, 
  Bell,
  Palette,
  Globe,
  Sparkles
} from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure project and organization settings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="space-y-6 lg:col-span-2">
          {/* Project Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Building className="h-5 w-5" />
                Project Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Project Name</label>
                <Input 
                  defaultValue="Berlin Office Tower" 
                  className="mt-1.5 bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Project Code</label>
                <Input 
                  defaultValue="BOT-2026" 
                  className="mt-1.5 bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <Input 
                  defaultValue="12-story office building with underground parking" 
                  className="mt-1.5 bg-background"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <Button variant="secondary" size="sm">Invite Member</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Max Klein", email: "max@example.com", role: "Admin", initials: "MK" },
                  { name: "Anna Schmidt", email: "anna@example.com", role: "Editor", initials: "AS" },
                  { name: "Thomas Mueller", email: "thomas@example.com", role: "Viewer", initials: "TM" },
                ].map((member) => (
                  <div 
                    key={member.email}
                    className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-medium text-foreground">
                        {member.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{member.role}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Enable AI Suggestions</p>
                  <p className="text-xs text-muted-foreground">Show AI-powered fix suggestions in scans</p>
                </div>
                <div className="h-5 w-9 rounded-full bg-foreground p-0.5">
                  <div className="h-4 w-4 translate-x-4 rounded-full bg-background transition-transform" />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Confidence Threshold</p>
                  <p className="text-xs text-muted-foreground">Only show suggestions above this confidence</p>
                </div>
                <Badge variant="secondary">75%</Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Pattern Detection</p>
                  <p className="text-xs text-muted-foreground">Learn from past fixes to improve suggestions</p>
                </div>
                <div className="h-5 w-9 rounded-full bg-foreground p-0.5">
                  <div className="h-4 w-4 translate-x-4 rounded-full bg-background transition-transform" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                AI suggestions are always labeled and require human approval before application.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Scan completed", enabled: true },
                { label: "Critical issues found", enabled: true },
                { label: "Fix pack ready", enabled: true },
                { label: "Team activity", enabled: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <div className={`h-5 w-9 rounded-full p-0.5 ${item.enabled ? "bg-foreground" : "bg-muted"}`}>
                    <div className={`h-4 w-4 rounded-full transition-transform ${
                      item.enabled ? "translate-x-4 bg-background" : "bg-muted-foreground"
                    }`} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Default Profile */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Default Market Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-foreground bg-secondary px-3 py-2 mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-foreground" />
                  <span className="text-sm font-medium text-foreground">Germany (BIM.DE v2.1)</span>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="w-full">
                Change Default Profile
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Two-factor auth</span>
                <Badge className="bg-success/20 text-success">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">SSO</span>
                <Badge variant="secondary">Not configured</Badge>
              </div>
              <Button variant="secondary" size="sm" className="w-full mt-2">
                Security Settings
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-card border-destructive/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-destructive">
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="secondary" size="sm" className="w-full">
                Archive Project
              </Button>
              <Button variant="destructive" size="sm" className="w-full">
                Delete Project
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
