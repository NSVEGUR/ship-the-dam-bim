import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, Globe, ChevronRight } from "lucide-react"
import Link from "next/link"

const requirements = [
  { name: "Object Classification", status: "pass" },
  { name: "Property Sets", status: "fail" },
  { name: "Naming Conventions", status: "pass" },
  { name: "Geometry Validation", status: "pass" },
  { name: "Level of Detail", status: "fail" },
  { name: "Coordinate System", status: "pass" },
]

export function MarketProfileCard() {
  const passCount = requirements.filter(r => r.status === "pass").length
  const totalCount = requirements.length

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
            <Globe className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Germany (BIM.DE v2.1)
            </CardTitle>
            <p className="text-sm text-muted-foreground">Active Market Profile</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-secondary text-foreground">
          {passCount}/{totalCount} Requirements
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {requirements.map((req) => (
            <div 
              key={req.name}
              className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2"
            >
              {req.status === "pass" ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <X className="h-4 w-4 text-destructive" />
              )}
              <span className="text-sm text-foreground">{req.name}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Last validated: 2 hours ago
          </p>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/profiles" className="flex items-center gap-1">
              View Profile Details
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
