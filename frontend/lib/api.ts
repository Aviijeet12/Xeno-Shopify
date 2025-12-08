const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string | null
}

async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json")
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    ...options,
    headers,
  })

  const body: ApiResponse<T> = await response.json().catch(() => ({ success: false, data: null as T, message: "Invalid response" }))

  if (!response.ok || !body.success) {
    throw new Error(body.message || `Request failed with status ${response.status}`)
  }

  return body.data
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  expiresInSeconds: number
  userId: string
  tenantId?: string | null
  role: string
  issuedAt: string
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export interface OnboardTenantPayload {
  shopDomain: string
  accessToken: string
  contactEmail: string
}

export interface TenantResponse {
  id: string
  shopDomain: string
  contactEmail: string
  createdAt: string
  lastSyncAt?: string | null
}

export async function onboardTenant(payload: OnboardTenantPayload, token?: string | null): Promise<TenantResponse> {
  return apiRequest<TenantResponse>("/api/tenants/onboard", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token)
}

export async function getTenants(token: string): Promise<TenantResponse[]> {
  return apiRequest<TenantResponse[]>("/api/tenants", { method: "GET" }, token)
}

export interface OverviewMetrics {
  totalCustomers: number
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  lastSyncAt?: string | null
}

interface MetricsOverviewDto {
  customerCount: number
  orderCount: number
  productCount: number
  totalRevenue: number
  lastSyncAt?: string | null
}

export async function getOverviewMetrics(tenantId: string, token: string): Promise<OverviewMetrics> {
  const data = await apiRequest<MetricsOverviewDto>(`/api/${tenantId}/metrics/overview`, { method: "GET" }, token)
  const totalRevenue = Number(data.totalRevenue || 0)
  const totalOrders = Number(data.orderCount || 0)

  return {
    totalCustomers: data.customerCount,
    totalOrders,
    totalRevenue,
    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    lastSyncAt: data.lastSyncAt,
  }
}

export interface OrderMetric {
  date: string
  orders: number
  revenue: number
}

interface OrderMetricsPointDto {
  date: string
  orderCount: number
  totalSales: number
}

export async function getOrderMetrics(tenantId: string, from: string, to: string, token: string): Promise<OrderMetric[]> {
  const params = new URLSearchParams({ from, to })
  const data = await apiRequest<OrderMetricsPointDto[]>(`/api/${tenantId}/metrics/orders?${params}`, { method: "GET" }, token)
  return data.map((point) => ({
    date: point.date,
    orders: point.orderCount,
    revenue: Number(point.totalSales || 0),
  }))
}

export interface TopCustomer {
  id: string
  name: string
  email: string
  totalSpent: number
  orderCount?: number
}

interface TopCustomerDto {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  totalSpent: number
  updatedAt?: string | null
}

export async function getTopCustomers(tenantId: string, limit: number, token: string): Promise<TopCustomer[]> {
  const params = new URLSearchParams({ limit: String(limit) })
  const data = await apiRequest<TopCustomerDto[]>(`/api/${tenantId}/metrics/top-customers?${params}`, { method: "GET" }, token)
  return data.map((customer) => ({
    id: customer.id,
    name: [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email,
    email: customer.email,
    totalSpent: Number(customer.totalSpent || 0),
  }))
}

export interface RecentOrder {
  id: string
  orderNumber: string
  totalPrice: number
  currency: string
  date: string
  status?: string
}

interface RecentOrderDto {
  id: string
  orderNumber: string
  totalPrice: number
  currency: string
  createdAt: string
}

export async function getRecentOrders(tenantId: string, limit: number, token: string): Promise<RecentOrder[]> {
  const params = new URLSearchParams({ limit: String(limit) })
  const data = await apiRequest<RecentOrderDto[]>(`/api/${tenantId}/metrics/recent-orders?${params}`, { method: "GET" }, token)
  return data.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    totalPrice: Number(order.totalPrice || 0),
    currency: order.currency || "USD",
    date: order.createdAt,
    status: "synced",
  }))
}

export async function triggerSync(tenantId: string, token?: string | null) {
  return apiRequest(`/api/tenants/${tenantId}/sync`, { method: "POST" }, token || undefined)
}

export interface ProductRecord {
  id: string
  shopProductId: number
  title: string
  price: number
  createdAt: string
  updatedAt?: string | null
}

interface ProductDto {
  id: string
  shopProductId: number
  title: string
  price: number
  createdAt: string
  updatedAt?: string | null
}

export interface CreateProductPayload {
  title: string
  price: number
  shopProductId?: number
}

const mapProduct = (product: ProductDto): ProductRecord => ({
  ...product,
  price: Number(product.price || 0),
})

export async function getProducts(tenantId: string, token: string): Promise<ProductRecord[]> {
  const data = await apiRequest<ProductDto[]>(`/api/${tenantId}/products`, { method: "GET" }, token)
  return data.map(mapProduct)
}

export async function createProduct(
  tenantId: string,
  payload: CreateProductPayload,
  token: string,
): Promise<ProductRecord> {
  const data = await apiRequest<ProductDto>(
    `/api/${tenantId}/products`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  )
  return mapProduct(data)
}
