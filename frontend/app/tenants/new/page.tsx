"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Store, Globe, Key, Mail, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { onboardTenant } from "@/lib/api"

export default function NewTenantPage() {
  const router = useRouter()
  const { token, fetchTenants } = useStore()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    shopDomain: "",
    accessToken: "",
    contactEmail: "",
  })

  useEffect(() => {
    if (!token) {
      router.push("/login")
    }
  }, [token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      router.push("/login")
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onboardTenant(formData, token)
      await fetchTenants()
      setSuccess(true)
      setTimeout(() => {
        router.push("/tenants")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to onboard store")
    } finally {
      setLoading(false)
    }
  }

  if (!token) return null

  return (
    <div className="min-h-screen p-6 md:p-8 bg-secondary/20">
      <div className="max-w-lg mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/tenants")}
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stores
        </Button>

        <Card>
          {success ? (
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Store Added Successfully</h2>
              <p className="text-muted-foreground">Redirecting to your stores...</p>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                    <Store className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle>Add New Store</CardTitle>
                    <CardDescription>Connect a Shopify store</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="shopDomain" className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      Store Domain
                    </Label>
                    <Input
                      id="shopDomain"
                      type="text"
                      placeholder="your-store.myshopify.com"
                      value={formData.shopDomain}
                      onChange={(e) => setFormData({ ...formData, shopDomain: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Enter your full Shopify domain</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accessToken" className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-muted-foreground" />
                      Admin API Token
                    </Label>
                    <Input
                      id="accessToken"
                      type="password"
                      placeholder="shpat_xxxxxxxxxxxxxxxx"
                      value={formData.accessToken}
                      onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Generate from Shopify Admin &gt; Apps &gt; Develop apps
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Contact Email
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="admin@yourstore.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      required
                    />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.push("/tenants")} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Store"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
