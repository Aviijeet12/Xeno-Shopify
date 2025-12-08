"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Store, ExternalLink, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"

export default function TenantsPage() {
  const router = useRouter()
  const { token, tenants, setSelectedTenant, fetchTenants } = useStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      router.push("/login")
      return
    }

    let cancelled = false
    async function loadTenants() {
      try {
        setLoading(true)
        setError(null)
        await fetchTenants()
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load stores")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadTenants()
    return () => {
      cancelled = true
    }
  }, [token, router, fetchTenants])

  const handleOpenDashboard = (tenantId: string) => {
    setSelectedTenant(tenantId)
    router.push(`/dashboard/${tenantId}`)
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "connected":
        return { icon: Wifi, className: "bg-success/10 text-success", label: "Connected" }
      case "syncing":
        return { icon: RefreshCw, className: "bg-warning/10 text-warning", label: "Syncing" }
      case "error":
        return { icon: WifiOff, className: "bg-destructive/10 text-destructive", label: "Error" }
      default:
        return { icon: Wifi, className: "bg-muted text-muted-foreground", label: "Unknown" }
    }
  }

  if (!token) return null

  return (
    <div className="min-h-screen p-6 md:p-8 bg-secondary/20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Your Stores</h1>
            <p className="text-muted-foreground mt-1">Manage and monitor your connected Shopify stores</p>
          </div>
          <Button onClick={() => router.push("/tenants/new")} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Store
          </Button>
        </div>

        {error && (
          <Card className="mb-4 border-destructive/40">
            <CardContent className="pt-4 text-destructive text-sm">{error}</CardContent>
          </Card>
        )}

        {/* Tenant Grid */}
        {loading ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your stores…</p>
            </CardContent>
          </Card>
        ) : tenants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenants.map((tenant) => {
              const statusConfig = getStatusConfig(tenant.status)
              const StatusIcon = statusConfig.icon

              return (
                <Card key={tenant.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Store className="w-5 h-5 text-primary" />
                      </div>
                      <Badge variant="outline" className={statusConfig.className}>
                        <StatusIcon className={`w-3 h-3 mr-1 ${tenant.status === "syncing" ? "animate-spin" : ""}`} />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3">{tenant.name}</CardTitle>
                    <CardDescription className="truncate">{tenant.domain}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tenant.lastSync && (
                      <p className="text-xs text-muted-foreground mb-4">
                        Last sync: {new Date(tenant.lastSync).toLocaleDateString()}
                      </p>
                    )}
                    <Button onClick={() => handleOpenDashboard(tenant.id)} variant="outline" className="w-full gap-2">
                      Open Dashboard
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No stores connected</h3>
              <p className="text-muted-foreground mb-6">Connect your first Shopify store to get started</p>
              <Button onClick={() => router.push("/tenants/new")} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Your First Store
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
