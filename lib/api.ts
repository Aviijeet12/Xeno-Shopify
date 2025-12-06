const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export interface OnboardTenantPayload {
  shopDomain: string
  accessToken: string
  email: string
}

export interface OverviewMetrics {
  totalCustomers: number
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
}

export interface OrderMetric {
  date: string
  orders: number
  revenue: number
}

export interface TopCustomer {
  id: string
  name: string
  email: string
  totalSpent: number
  orderCount: number
}

export interface RecentOrder {
  id: string
  orderNumber: string
  totalPrice: number
  currency: string
  date: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
}

// API Functions
export async function onboardTenant(payload: OnboardTenantPayload) {
  const response = await fetch(`${API_BASE}/api/tenants/onboard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  return response.json()
}

export async function getTenants() {
  const response = await fetch(`${API_BASE}/api/tenants`)
  return response.json()
}

export async function getOverviewMetrics(tenantId: string): Promise<OverviewMetrics> {
  // Placeholder data for demo
  return {
    totalCustomers: 12847,
    totalOrders: 34521,
    totalRevenue: 1284750.5,
    averageOrderValue: 37.22,
  }
}

export async function getOrderMetrics(tenantId: string, from: string, to: string): Promise<OrderMetric[]> {
  // Generate sample data
  const data: OrderMetric[] = []
  const startDate = new Date(from)
  const endDate = new Date(to)

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    data.push({
      date: d.toISOString().split("T")[0],
      orders: Math.floor(Math.random() * 200) + 50,
      revenue: Math.floor(Math.random() * 10000) + 2000,
    })
  }
  return data
}

export async function getTopCustomers(tenantId: string, limit = 5): Promise<TopCustomer[]> {
  return [
    { id: "1", name: "Sarah Johnson", email: "sarah@example.com", totalSpent: 4521.5, orderCount: 47 },
    { id: "2", name: "Michael Chen", email: "michael@example.com", totalSpent: 3892.0, orderCount: 38 },
    { id: "3", name: "Emma Wilson", email: "emma@example.com", totalSpent: 3245.75, orderCount: 31 },
    { id: "4", name: "James Brown", email: "james@example.com", totalSpent: 2987.25, orderCount: 28 },
    { id: "5", name: "Olivia Davis", email: "olivia@example.com", totalSpent: 2654.0, orderCount: 24 },
  ].slice(0, limit)
}

export async function getRecentOrders(tenantId: string): Promise<RecentOrder[]> {
  const statuses: RecentOrder["status"][] = ["pending", "processing", "shipped", "delivered", "cancelled"]
  return Array.from({ length: 10 }, (_, i) => ({
    id: `order-${i + 1}`,
    orderNumber: `#${10000 + i}`,
    totalPrice: Math.floor(Math.random() * 500) + 20,
    currency: "USD",
    date: new Date(Date.now() - i * 86400000).toISOString(),
    status: statuses[Math.floor(Math.random() * 4)],
  }))
}

export async function triggerSync(tenantId: string) {
  const response = await fetch(`${API_BASE}/api/tenants/${tenantId}/sync`, {
    method: "POST",
  })
  return response.json()
}
