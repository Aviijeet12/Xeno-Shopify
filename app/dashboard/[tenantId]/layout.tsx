"use client"

import type React from "react"
import { useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { useStore } from "@/lib/store"

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = use(params)
  const router = useRouter()
  const { token, setSelectedTenant } = useStore()

  useEffect(() => {
    if (!token) {
      router.push("/login")
    } else {
      setSelectedTenant(tenantId)
    }
  }, [token, tenantId, router, setSelectedTenant])

  if (!token) return null

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar tenantId={tenantId} />
      <div className="pl-64">
        <DashboardHeader tenantId={tenantId} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
