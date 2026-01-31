import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Send, ArrowRight } from "lucide-react"
import Link from "next/link"

export function ReadinessActions() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Next Steps
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-md bg-secondary p-4">
          <h4 className="text-sm font-medium text-foreground mb-1">
            Model is not ready for submission
          </h4>
          <p className="text-xs text-muted-foreground mb-3">
            Resolve critical issues before submitting to your CDE.
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-destructive font-medium">12 critical</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-warning font-medium">28 warnings</span>
          </div>
        </div>

        <Button className="w-full justify-between" asChild>
          <Link href="/fix-packs">
            <span className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Fix Pack
            </span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        <Button variant="secondary" className="w-full justify-start gap-2">
          <FileText className="h-4 w-4" />
          Download BCF Issues
        </Button>

        <Button variant="secondary" className="w-full justify-start gap-2" disabled>
          <Send className="h-4 w-4" />
          Submit to CDE
          <span className="ml-auto text-xs text-muted-foreground">(Resolve critical first)</span>
        </Button>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Submission checklist</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="h-4 w-4 rounded border border-border" />
              <span className="text-muted-foreground">All critical issues resolved</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-4 w-4 rounded border border-border" />
              <span className="text-muted-foreground">Fix Pack reviewed</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-4 w-4 rounded bg-foreground flex items-center justify-center">
                <svg className="h-3 w-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-foreground">Market profile selected</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
