import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Tenant {
  id: string
  name: string
  domain: string
  status: "connected" | "syncing" | "error"
  lastSync?: string
  email?: string
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
}

export const useStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      tenants: [
        {
          id: "tenant-1",
          name: "Fashion Store",
          domain: "fashion-store.myshopify.com",
          status: "connected",
          lastSync: new Date().toISOString(),
          email: "admin@fashion.com",
        },
        {
          id: "tenant-2",
          name: "Tech Gadgets",
          domain: "tech-gadgets.myshopify.com",
          status: "syncing",
          lastSync: new Date(Date.now() - 3600000).toISOString(),
          email: "admin@techgadgets.com",
        },
        {
          id: "tenant-3",
          name: "Home Decor",
          domain: "home-decor.myshopify.com",
          status: "error",
          email: "support@homedecor.com",
        },
      ],
      selectedTenantId: null,
      login: async (email: string, _password: string) => {
        // Placeholder login logic
        await new Promise((resolve) => setTimeout(resolve, 1000))
        set({
          token: "fake-jwt-token-" + Date.now(),
          user: { email, name: email.split("@")[0] },
        })
        return true
      },
      logout: () => {
        set({ token: null, user: null, selectedTenantId: null })
      },
      addTenant: (tenant) => {
        set((state) => ({ tenants: [...state.tenants, tenant] }))
      },
      removeTenant: (id) => {
        set((state) => ({ tenants: state.tenants.filter((t) => t.id !== id) }))
      },
      setSelectedTenant: (id) => {
        set({ selectedTenantId: id })
      },
      updateTenantStatus: (id, status) => {
        set((state) => ({
          tenants: state.tenants.map((t) => (t.id === id ? { ...t, status } : t)),
        }))
      },
    }),
    {
      name: "xeno-store",
    },
  ),
)
