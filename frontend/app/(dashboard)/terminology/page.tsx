"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Plus,
  ChevronDown,
  Check,
  X,
  AlertTriangle,
  Languages,
  Download
} from "lucide-react"

type Term = {
  id: string
  english: string
  german: string
  status: "approved" | "pending" | "rejected"
  category: string
  usageCount: number
}

const terms: Term[] = [
  { id: "1", english: "Wall", german: "Wand", status: "approved", category: "Building Elements", usageCount: 234 },
  { id: "2", english: "Load-bearing Wall", german: "Tragende Wand", status: "approved", category: "Building Elements", usageCount: 89 },
  { id: "3", english: "External Wall", german: "Außenwand", status: "approved", category: "Building Elements", usageCount: 67 },
  { id: "4", english: "Fire Rating", german: "Feuerwiderstandsklasse", status: "approved", category: "Properties", usageCount: 156 },
  { id: "5", english: "Floor Slab", german: "Geschossdecke", status: "approved", category: "Building Elements", usageCount: 45 },
  { id: "6", english: "Structural Column", german: "Tragstütze", status: "pending", category: "Building Elements", usageCount: 23 },
  { id: "7", english: "Curtain Wall", german: "Vorhangfassade", status: "approved", category: "Building Elements", usageCount: 12 },
  { id: "8", english: "Building Services", german: "Gebäudetechnik", status: "approved", category: "Systems", usageCount: 78 },
  { id: "9", english: "HVAC System", german: "HLK-Anlage", status: "pending", category: "Systems", usageCount: 34 },
  { id: "10", english: "Staircase", german: "Treppenhaus", status: "rejected", category: "Building Elements", usageCount: 18 },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return <Badge className="bg-success/20 text-success gap-1"><Check className="h-3 w-3" />Approved</Badge>
    case "pending":
      return <Badge className="bg-warning/20 text-warning gap-1"><AlertTriangle className="h-3 w-3" />Pending</Badge>
    case "rejected":
      return <Badge variant="destructive" className="bg-destructive/20 text-destructive gap-1"><X className="h-3 w-3" />Rejected</Badge>
    default:
      return null
  }
}

export default function TerminologyPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "rejected">("all")

  const filteredTerms = terms.filter(term => {
    const matchesSearch = term.english.toLowerCase().includes(search.toLowerCase()) ||
                          term.german.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || term.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const approvedCount = terms.filter(t => t.status === "approved").length
  const pendingCount = terms.filter(t => t.status === "pending").length
  const rejectedCount = terms.filter(t => t.status === "rejected").length

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Terminology Governance</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage approved translations and naming conventions for the Germany profile
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export Glossary
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Term
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
              <Languages className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{terms.length}</p>
              <p className="text-sm text-muted-foreground">Total Terms</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-success/20">
              <Check className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive/20">
              <X className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{rejectedCount}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border mb-6">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search terms in English or German..." 
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={statusFilter === "all" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button 
              variant={statusFilter === "approved" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setStatusFilter("approved")}
            >
              Approved
            </Button>
            <Button 
              variant={statusFilter === "pending" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setStatusFilter("pending")}
            >
              Pending
            </Button>
            <Button 
              variant={statusFilter === "rejected" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setStatusFilter("rejected")}
            >
              Rejected
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Terminology Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  English
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  German
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Usage
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTerms.map((term) => (
                <tr key={term.id} className="group hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-foreground">{term.english}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-foreground">{term.german}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">{term.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(term.status)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">{term.usageCount} uses</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
