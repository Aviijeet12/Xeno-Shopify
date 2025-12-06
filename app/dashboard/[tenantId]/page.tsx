"use client"

import { use, useEffect, useState } from "react"
import { Users, ShoppingCart, DollarSign, TrendingUp } from "lucide-react"
import { MetricCard } from "@/components/dashboard/metric-card"
import { OrdersChart } from "@/components/dashboard/orders-chart"
import { TopCustomersTable } from "@/components/dashboard/top-customers-table"
import { RecentOrdersList } from "@/components/dashboard/recent-orders-list"
import { getOverviewMetrics, type OverviewMetrics } from "@/lib/api"

export default function DashboardOverviewPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = use(params)
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true)
      const data = await getOverviewMetrics(tenantId)
      setMetrics(data)
      setLoading(false)
    }
    loadMetrics()
  }, [tenantId])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Overview</h1>
        <p className="text-muted-foreground">Your store performance at a glance</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Customers"
          value={loading ? "..." : formatNumber(metrics?.totalCustomers || 0)}
          icon={Users}
          trend={{ value: 12.5, isPositive: true }}
        />
        <MetricCard
          title="Total Orders"
          value={loading ? "..." : formatNumber(metrics?.totalOrders || 0)}
          icon={ShoppingCart}
          trend={{ value: 8.2, isPositive: true }}
        />
        <MetricCard
          title="Total Revenue"
          value={loading ? "..." : formatCurrency(metrics?.totalRevenue || 0)}
          icon={DollarSign}
          trend={{ value: 15.3, isPositive: true }}
        />
        <MetricCard
          title="Avg Order Value"
          value={loading ? "..." : `$${(metrics?.averageOrderValue || 0).toFixed(2)}`}
          icon={TrendingUp}
          trend={{ value: 3.1, isPositive: true }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrdersChart tenantId={tenantId} />
        <TopCustomersTable tenantId={tenantId} />
      </div>

      {/* Recent Orders */}
      <RecentOrdersList tenantId={tenantId} />
    </div>
  )
}
