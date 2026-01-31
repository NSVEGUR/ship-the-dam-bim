"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, TrendingUp } from "lucide-react"

export function ReadinessScoreCard() {
  const score = 73
  const previousScore = 58
  const change = score - previousScore

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Readiness Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">{score}</span>
              <span className="text-lg text-muted-foreground">/100</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-sm">
              <span className="flex items-center gap-1 text-success">
                <ArrowUp className="h-3.5 w-3.5" />
                +{change}
              </span>
              <span className="text-muted-foreground">from last scan</span>
            </div>
          </div>
          
          {/* Circular Progress */}
          <div className="relative h-20 w-20">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${score}, 100`}
                className="text-success"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-4 rounded-md bg-warning/10 px-3 py-2">
          <p className="text-sm font-medium text-warning">
            Not ready for submission
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            12 critical issues must be resolved
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
