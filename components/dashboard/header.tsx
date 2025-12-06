"use client"

import { Bell, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export function DashboardHeader({ tenantId }: { tenantId: string }) {
  const { user, tenants } = useStore()
  const currentTenant = tenants.find((t) => t.id === tenantId)

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-40">
      <h1 className="text-lg font-medium text-foreground">{currentTenant?.name || "Dashboard"}</h1>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative w-9 h-9">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </Button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-border">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground leading-tight">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
