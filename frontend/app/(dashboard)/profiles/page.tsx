import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Globe, 
  Check, 
  ChevronRight, 
  FileText, 
  BookOpen, 
  Settings,
  Clock
} from "lucide-react"
import Link from "next/link"

const profiles = [
  {
    id: "germany",
    name: "Germany",
    code: "BIM.DE",
    version: "v2.1",
    status: "active",
    requirements: 156,
    glossaryTerms: 2340,
    objectMaps: 89,
    lastUpdated: "Jan 15, 2026",
    description: "German BIM standard requirements including DIN 276 classification and BIM.DE property sets.",
  },
  {
    id: "uk",
    name: "United Kingdom",
    code: "UK BIM",
    version: "v1.2",
    status: "scaffolded",
    requirements: 142,
    glossaryTerms: 1890,
    objectMaps: 76,
    lastUpdated: "Coming Q2 2026",
    description: "UK BIM Framework requirements with Uniclass 2015 classification system.",
  },
  {
    id: "netherlands",
    name: "Netherlands",
    code: "NL-SfB",
    version: "v3.0",
    status: "scaffolded",
    requirements: 128,
    glossaryTerms: 1650,
    objectMaps: 68,
    lastUpdated: "Coming Q2 2026",
    description: "Dutch BIM requirements with NL-SfB classification and NLRS property sets.",
  },
  {
    id: "nordics",
    name: "Nordics",
    code: "CoClass",
    version: "v1.0",
    status: "scaffolded",
    requirements: 134,
    glossaryTerms: 1780,
    objectMaps: 72,
    lastUpdated: "Coming Q3 2026",
    description: "Nordic region BIM requirements with CoClass classification system.",
  },
]

export default function ProfilesPage() {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Market Profiles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure validation rules and terminology for different market requirements
          </p>
        </div>
        <Button variant="secondary" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Compare Profiles
        </Button>
      </div>

      {/* Active Profile */}
      <Card className="bg-card border-border mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-foreground text-background">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Germany (BIM.DE v2.1)
              </CardTitle>
              <p className="text-sm text-muted-foreground">Currently active for this project</p>
            </div>
          </div>
          <Badge className="bg-success/20 text-success">Active</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {profiles[0].description}
          </p>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-md bg-secondary p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <FileText className="h-4 w-4" />
                <span className="text-xs">Requirements</span>
              </div>
              <p className="text-xl font-bold text-foreground">{profiles[0].requirements}</p>
            </div>
            <div className="rounded-md bg-secondary p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs">Glossary Terms</span>
              </div>
              <p className="text-xl font-bold text-foreground">{profiles[0].glossaryTerms.toLocaleString()}</p>
            </div>
            <div className="rounded-md bg-secondary p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Settings className="h-4 w-4" />
                <span className="text-xs">Object Maps</span>
              </div>
              <p className="text-xl font-bold text-foreground">{profiles[0].objectMaps}</p>
            </div>
            <div className="rounded-md bg-secondary p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs">Last Updated</span>
              </div>
              <p className="text-sm font-medium text-foreground mt-1">{profiles[0].lastUpdated}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
            <Button size="sm" asChild>
              <Link href="/profiles/germany">View Requirements</Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/terminology">Edit Glossary</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* All Profiles */}
      <h2 className="text-lg font-semibold text-foreground mb-4">All Market Profiles</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {profiles.map((profile) => (
          <Card 
            key={profile.id}
            className={`bg-card border-border ${profile.status === "scaffolded" ? "opacity-60" : ""}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-md ${
                    profile.status === "active" ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"
                  }`}>
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{profile.name}</h3>
                    <p className="text-xs text-muted-foreground">{profile.code} {profile.version}</p>
                  </div>
                </div>
                {profile.status === "active" ? (
                  <Badge className="bg-success/20 text-success">Active</Badge>
                ) : (
                  <Badge variant="secondary">Coming Soon</Badge>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {profile.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span>{profile.requirements} requirements</span>
                <span className="text-border">•</span>
                <span>{profile.glossaryTerms.toLocaleString()} terms</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{profile.lastUpdated}</span>
                {profile.status === "active" ? (
                  <Button variant="ghost" size="sm" className="gap-1" asChild>
                    <Link href={`/profiles/${profile.id}`}>
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" disabled>
                    Coming Soon
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
