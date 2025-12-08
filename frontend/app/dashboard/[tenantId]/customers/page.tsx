"use client"

import { use, useEffect, useState } from "react"
import { Search, Mail, ShoppingBag, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { getTopCustomers, type TopCustomer } from "@/lib/api"

export default function CustomersPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = use(params)
  const [customers, setCustomers] = useState<TopCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const data = await getTopCustomers(tenantId, 5)
      const moreCustomers: TopCustomer[] = [
        ...data,
        { id: "6", name: "David Martinez", email: "david@example.com", totalSpent: 2341.0, orderCount: 21 },
        { id: "7", name: "Sophie Turner", email: "sophie@example.com", totalSpent: 1987.5, orderCount: 18 },
        { id: "8", name: "Alex Kim", email: "alex@example.com", totalSpent: 1765.25, orderCount: 15 },
        { id: "9", name: "Rachel Green", email: "rachel@example.com", totalSpent: 1543.0, orderCount: 14 },
        { id: "10", name: "Tom Wilson", email: "tom@example.com", totalSpent: 1298.75, orderCount: 12 },
      ]
      setCustomers(moreCustomers)
      setLoading(false)
    }
    loadData()
  }, [tenantId])

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
        <p className="text-muted-foreground">View and manage your customer base</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No customers found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-4 rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{customer.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Spent</p>
                      <p className="font-semibold text-foreground">{formatCurrency(customer.totalSpent)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                        <ShoppingBag className="w-3 h-3" />
                        Orders
                      </p>
                      <p className="font-semibold text-foreground">{customer.orderCount}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full mt-3 text-muted-foreground hover:text-foreground">
                    <Eye className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
