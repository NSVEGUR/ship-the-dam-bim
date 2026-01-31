"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

const profiles = [
  { 
    id: "germany", 
    name: "Germany", 
    version: "BIM.DE v2.1",
    status: "active",
    requirements: 156,
  },
  { 
    id: "uk", 
    name: "United Kingdom", 
    version: "UK BIM v1.2",
    status: "scaffolded",
    requirements: 142,
  },
  { 
    id: "netherlands", 
    name: "Netherlands", 
    version: "NL-SfB v3.0",
    status: "scaffolded",
    requirements: 128,
  },
  { 
    id: "nordics", 
    name: "Nordics", 
    version: "CoClass v1.0",
    status: "scaffolded",
    requirements: 134,
  },
]

type ProfileSelectorProps = {
  selected: string
  onSelect: (id: string) => void
  disabled?: boolean
}

export function ProfileSelector({ selected, onSelect, disabled }: ProfileSelectorProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Market Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {profiles.map((profile) => {
          const isSelected = selected === profile.id
          const isAvailable = profile.status === "active"
          
          return (
            <button
              key={profile.id}
              onClick={() => isAvailable && !disabled && onSelect(profile.id)}
              disabled={!isAvailable || disabled}
              className={cn(
                "flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left transition-colors",
                isSelected
                  ? "border-foreground bg-secondary"
                  : "border-border hover:border-muted-foreground",
                (!isAvailable || disabled) && "cursor-not-allowed opacity-50"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md",
                isSelected ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
              )}>
                <Globe className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{profile.name}</span>
                  {!isAvailable && (
                    <span className="text-xs text-muted-foreground">(Coming soon)</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {profile.version} • {profile.requirements} requirements
                </span>
              </div>

              {isSelected && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground">
                  <Check className="h-3 w-3 text-background" />
                </div>
              )}
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}
