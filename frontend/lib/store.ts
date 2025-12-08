import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getTenants as fetchTenantsFromApi, login as loginApi, type TenantResponse } from "@/lib/api"

export interface Tenant {
  id: string
  name: string
  domain: string
  status: "connected" | "syncing" | "error"
  lastSync?: string | null
  email?: string | null
}

interface AuthState {
  token: string | null
  user: { email: string; name: string } | null
  tenants: Tenant[]
  selectedTenantId: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  addTenant: (tenant: Tenant) => void
  removeTenant: (id: string) => void
  setSelectedTenant: (id: string) => void
  updateTenantStatus: (id: string, status: Tenant["status"]) => void
  fetchTenants: () => Promise<void>
}

const formatTenantName = (domain: string) =>
  domain
    .replace(/\.myshopify\.com$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

const mapTenantResponse = (tenant: TenantResponse): Tenant => ({
  id: tenant.id,
  name: formatTenantName(tenant.shopDomain),
  domain: tenant.shopDomain,
  status: tenant.lastSyncAt ? "connected" : "syncing",
  lastSync: tenant.lastSyncAt || tenant.createdAt,
  email: tenant.contactEmail,
})

export const useStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      tenants: [],
      selectedTenantId: null,
      login: async (email: string, password: string) => {
        const auth = await loginApi({ email, password })
        set({
          token: auth.token,
          user: { email, name: email.split("@")[0] },
        })
        await get().fetchTenants()
        return true
      },
      logout: () => {
        set({ token: null, user: null, tenants: [], selectedTenantId: null })
      },
      addTenant: (tenant) => {
        set((state) => {
          const existingIndex = state.tenants.findIndex((t) => t.id === tenant.id)
          const tenants = existingIndex >= 0
            ? state.tenants.map((t) => (t.id === tenant.id ? tenant : t))
            : [...state.tenants, tenant]
          return {
            tenants,
            selectedTenantId: state.selectedTenantId || tenant.id,
          }
        })
      },
      removeTenant: (id) => {
        set((state) => ({
          tenants: state.tenants.filter((t) => t.id !== id),
          selectedTenantId: state.selectedTenantId === id ? null : state.selectedTenantId,
        }))
      },
      setSelectedTenant: (id) => {
        set({ selectedTenantId: id })
      },
      updateTenantStatus: (id, status) => {
        set((state) => ({
          tenants: state.tenants.map((t) => (t.id === id ? { ...t, status } : t)),
        }))
      },
      fetchTenants: async () => {
        const token = get().token
        if (!token) {
          throw new Error("Not authenticated")
        }
        const tenants = await fetchTenantsFromApi(token)
        const mapped = tenants.map(mapTenantResponse)
        set((state) => ({
          tenants: mapped,
          selectedTenantId: state.selectedTenantId || mapped[0]?.id || null,
        }))
      },
    }),
    {
      name: "xeno-store",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        tenants: state.tenants,
        selectedTenantId: state.selectedTenantId,
      }),
    },
  ),
)
