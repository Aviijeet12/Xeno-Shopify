"use client"

import { useEffect, useState } from "react"
import { Crown, Mail, ShoppingBag } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTopCustomers, type TopCustomer } from "@/lib/api"
import { useStore } from "@/lib/store"

export function TopCustomersTable({ tenantId }: { tenantId: string }) {
  const [customers, setCustomers] = useState<TopCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const token = useStore((state) => state.token)

  useEffect(() => {
    if (!token) return

    let cancelled = false
    async function loadData() {
      setLoading(true)
      setError(null)
      try {
        const data = await getTopCustomers(tenantId, 5, token)
        if (!cancelled) {
          setCustomers(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load customers")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    loadData()
    return () => {
      cancelled = true
    }
  }, [tenantId, token])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-warning" />
          <CardTitle className="text-base">Top Customers</CardTitle>
        </div>
        <CardDescription>Customers by total spend</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[280px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="h-[280px] flex items-center justify-center text-sm text-destructive">{error}</div>
        ) : (
          <div className="space-y-3">
            {customers.map((customer, index) => (
              <div
                key={customer.id}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="relative">
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-warning rounded-full flex items-center justify-center">
                      <Crown className="w-2.5 h-2.5 text-warning-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{customer.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3" />
                    {customer.email}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{formatCurrency(customer.totalSpent)}</p>
                  {typeof customer.orderCount === "number" && (
                    <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                      <ShoppingBag className="w-3 h-3" />
                      {customer.orderCount}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
