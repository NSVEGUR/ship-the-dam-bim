import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ThumbsUp, ThumbsDown, Info } from "lucide-react"

const suggestions = [
  {
    id: "1",
    title: "Batch property set application",
    description: "Apply Pset_WallCommon to 23 walls with inferred values based on geometry analysis.",
    confidence: 92,
    impact: "Would resolve 23 critical issues",
  },
  {
    id: "2",
    title: "Naming convention fix",
    description: "Rename 45 elements from 'WALL_###' to 'A-ARC-WALL-###' pattern.",
    confidence: 88,
    impact: "Would resolve 45 warning issues",
  },
  {
    id: "3",
    title: "Classification mapping",
    description: "Map OmniClass references to DIN 276 equivalents using standard mapping table.",
    confidence: 76,
    impact: "Would resolve 1 critical issue",
  },
]

function getConfidenceColor(confidence: number) {
  if (confidence >= 90) return "text-success"
  if (confidence >= 75) return "text-warning"
  return "text-muted-foreground"
}

export function AISuggestionsPanel() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center gap-2">
        <Sparkles className="h-5 w-5 text-info" />
        <CardTitle className="text-base font-semibold text-foreground">
          AI Suggestions
        </CardTitle>
        <Badge variant="secondary" className="ml-auto">
          {suggestions.length}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-info/10 border border-info/20 px-3 py-2">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-info mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              AI suggestions are recommendations only. Review each suggestion before adding to your Fix Pack.
            </p>
          </div>
        </div>

        {suggestions.map((suggestion) => (
          <div 
            key={suggestion.id}
            className="rounded-md border border-border bg-background p-3"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-sm font-medium text-foreground">{suggestion.title}</h4>
              <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                {suggestion.confidence}% confidence
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{suggestion.description}</p>
            <p className="text-xs text-success mb-3">{suggestion.impact}</p>
            
            <div className="flex items-center justify-between">
              <Button variant="secondary" size="sm">
                Add to Fix Pack
              </Button>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ThumbsUp className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ThumbsDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        <p className="text-center text-xs text-muted-foreground pt-2">
          AI suggestions are labeled and always allow human override
        </p>
      </CardContent>
    </Card>
  )
}
