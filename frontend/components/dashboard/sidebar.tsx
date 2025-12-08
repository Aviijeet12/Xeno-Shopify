"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  RefreshCw,
  Settings,
  LogOut,
  ChevronDown,
  Store,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const menuItems = [
  { label: "Overview", icon: LayoutDashboard, path: "" },
  { label: "Orders", icon: ShoppingCart, path: "/orders" },
  { label: "Customers", icon: Users, path: "/customers" },
  { label: "Products", icon: Package, path: "/products" },
  { label: "Sync Status", icon: RefreshCw, path: "/sync" },
  { label: "Settings", icon: Settings, path: "/settings" },
]

export function DashboardSidebar({ tenantId }: { tenantId: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const { tenants, setSelectedTenant, logout } = useStore()

  const currentTenant = tenants.find((t) => t.id === tenantId) || tenants[0]

  const handleTenantChange = (id: string) => {
    setSelectedTenant(id)
    router.push(`/dashboard/${id}`)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link href="/tenants" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Store className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">Shopify Insights</span>
        </Link>
      </div>

      {/* Tenant Selector */}
      <div className="p-3 border-b border-border">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Store className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{currentTenant?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentTenant?.domain}</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {tenants.map((tenant) => (
              <DropdownMenuItem
                key={tenant.id}
                onClick={() => handleTenantChange(tenant.id)}
                className={cn("cursor-pointer", tenant.id === tenantId && "bg-secondary")}
              >
                <Store className="w-4 h-4 mr-2 text-primary" />
                <span className="truncate">{tenant.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const fullPath = `/dashboard/${tenantId}${item.path}`
          const isActive = item.path === "" ? pathname === `/dashboard/${tenantId}` : pathname.startsWith(fullPath)
          const Icon = item.icon

          return (
            <Link key={item.path} href={fullPath}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
