"use client"

import { useEffect, useState } from "react"
import { Package, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRecentOrders, type RecentOrder } from "@/lib/api"
import { format } from "date-fns"

export function RecentOrdersList({ tenantId }: { tenantId: string }) {
  const [orders, setOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const data = await getRecentOrders(tenantId)
      setOrders(data)
      setLoading(false)
    }
    loadData()
  }, [tenantId])

  const getStatusConfig = (status: RecentOrder["status"]) => {
    switch (status) {
      case "delivered":
        return { className: "bg-success/10 text-success" }
      case "shipped":
        return { className: "bg-primary/10 text-primary" }
      case "processing":
        return { className: "bg-warning/10 text-warning" }
      case "pending":
        return { className: "bg-muted text-muted-foreground" }
      case "cancelled":
        return { className: "bg-destructive/10 text-destructive" }
      default:
        return { className: "bg-muted text-muted-foreground" }
    }
  }

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          <div>
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <CardDescription>Latest order activity</CardDescription>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          View All
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => {
                  const statusConfig = getStatusConfig(order.status)
                  return (
                    <tr key={order.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{order.orderNumber}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {format(new Date(order.date), "MMM d, yyyy")}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {formatCurrency(order.totalPrice, order.currency)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={statusConfig.className}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
