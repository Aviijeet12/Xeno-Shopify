"use client"

import { use, useState } from "react"
import { RefreshCw, Clock, CheckCircle, AlertTriangle, XCircle, Play, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { triggerSync } from "@/lib/api"
import { format } from "date-fns"

interface SyncLog {
  id: string
  timestamp: string
  type: "orders" | "customers" | "products" | "inventory"
  status: "success" | "warning" | "error"
  message: string
  recordsProcessed: number
}

const sampleLogs: SyncLog[] = [
  {
    id: "1",
    timestamp: new Date().toISOString(),
    type: "orders",
    status: "success",
    message: "Successfully synced 156 orders",
    recordsProcessed: 156,
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    type: "customers",
    status: "success",
    message: "Successfully synced 89 customers",
    recordsProcessed: 89,
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: "products",
    status: "warning",
    message: "Synced 234 products with 3 warnings",
    recordsProcessed: 234,
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    type: "inventory",
    status: "success",
    message: "Inventory levels updated",
    recordsProcessed: 450,
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    type: "orders",
    status: "error",
    message: "API rate limit exceeded, retrying...",
    recordsProcessed: 45,
  },
]

export default function SyncStatusPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = use(params)
  const { tenants, updateTenantStatus } = useStore()
  const [syncing, setSyncing] = useState(false)

  const currentTenant = tenants.find((t) => t.id === tenantId)

  const handleSync = async () => {
    setSyncing(true)
    updateTenantStatus(tenantId, "syncing")

    try {
      await triggerSync(tenantId)
      await new Promise((resolve) => setTimeout(resolve, 3000))
      updateTenantStatus(tenantId, "connected")
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      updateTenantStatus(tenantId, "connected")
    } finally {
      setSyncing(false)
    }
  }

  const getStatusIcon = (status: SyncLog["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-success" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-warning" />
      case "error":
        return <XCircle className="w-4 h-4 text-destructive" />
    }
  }

  const getTypeBadge = (type: SyncLog["type"]) => {
    const colors: Record<string, string> = {
      orders: "bg-primary/10 text-primary",
      customers: "bg-chart-2/10 text-chart-2",
      products: "bg-success/10 text-success",
      inventory: "bg-warning/10 text-warning",
    }
    return (
      <Badge variant="outline" className={colors[type]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Sync Status</h1>
        <p className="text-muted-foreground">Monitor and trigger data synchronization</p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  syncing
                    ? "bg-warning/10"
                    : currentTenant?.status === "connected"
                      ? "bg-success/10"
                      : "bg-destructive/10"
                }`}
              >
                {syncing ? (
                  <RefreshCw className="w-6 h-6 text-warning animate-spin" />
                ) : currentTenant?.status === "connected" ? (
                  <CheckCircle className="w-6 h-6 text-success" />
                ) : (
                  <XCircle className="w-6 h-6 text-destructive" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">
                  {syncing ? "Syncing..." : currentTenant?.status === "connected" ? "All Data Synced" : "Sync Error"}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4" />
                  Last sync: {currentTenant?.lastSync ? format(new Date(currentTenant.lastSync), "PPpp") : "Never"}
                </CardDescription>
              </div>
            </div>
            <Button onClick={handleSync} disabled={syncing} className="gap-2">
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {syncing ? "Syncing..." : "Run Sync Now"}
            </Button>
          </div>
        </CardHeader>

        {syncing && (
          <CardContent className="border-t">
            <div className="space-y-3 py-2">
              {["Orders", "Customers", "Products", "Inventory"].map((item, index) => (
                <div key={item} className="flex items-center gap-4">
                  <span className="w-24 text-sm text-muted-foreground">{item}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-1000"
                      style={{
                        width: `${Math.min(100, (Date.now() % 4000) / 40 + index * 25)}%`,
                        animation: "pulse 1s ease-in-out infinite",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle>Sync History</CardTitle>
          <CardDescription>Recent synchronization activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sampleLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
              >
                <div className="mt-0.5">{getStatusIcon(log.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getTypeBadge(log.type)}
                    <span className="text-xs text-muted-foreground">{format(new Date(log.timestamp), "PPpp")}</span>
                  </div>
                  <p className="text-sm text-foreground">{log.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{log.recordsProcessed} records processed</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
