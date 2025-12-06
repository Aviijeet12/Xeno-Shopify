"use client"

import { use, useState, useEffect } from "react"
import { Store, Key, Bell, Shield, Trash2, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"

export default function SettingsPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = use(params)
  const router = useRouter()
  const { tenants, removeTenant } = useStore()
  const [saving, setSaving] = useState(false)
  const currentTenant = tenants.find((t) => t.id === tenantId)

  const [settings, setSettings] = useState({
    storeName: "",
    domain: "",
    apiToken: "",
    emailNotifications: true,
    syncNotifications: true,
    errorAlerts: true,
  })

  useEffect(() => {
    if (currentTenant) {
      setSettings((s) => ({
        ...s,
        storeName: currentTenant.name,
        domain: currentTenant.domain,
      }))
    }
  }, [currentTenant])

  const handleSave = async () => {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSaving(false)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this tenant? This action cannot be undone.")) {
      removeTenant(tenantId)
      router.push("/tenants")
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your store configuration</p>
      </div>

      {/* Store Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Store Configuration</CardTitle>
          </div>
          <CardDescription>Basic store information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain">Shopify Domain</Label>
            <Input
              id="domain"
              value={settings.domain}
              onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* API Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">API Configuration</CardTitle>
          </div>
          <CardDescription>Manage your API credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="apiToken">Admin API Token</Label>
            <Input
              id="apiToken"
              type="password"
              placeholder="shpat_xxxxxxxxxxxxxxxx"
              value={settings.apiToken}
              onChange={(e) => setSettings({ ...settings, apiToken: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Leave empty to keep the current token</p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Notifications</CardTitle>
          </div>
          <CardDescription>Configure notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive email updates about your store</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between py-2 border-t">
            <div>
              <p className="font-medium text-foreground">Sync Notifications</p>
              <p className="text-sm text-muted-foreground">Get notified when sync completes</p>
            </div>
            <Switch
              checked={settings.syncNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, syncNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between py-2 border-t">
            <div>
              <p className="font-medium text-foreground">Error Alerts</p>
              <p className="text-sm text-muted-foreground">Immediate alerts for sync failures</p>
            </div>
            <Switch
              checked={settings.errorAlerts}
              onCheckedChange={(checked) => setSettings({ ...settings, errorAlerts: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" />
            <CardTitle className="text-lg">Danger Zone</CardTitle>
          </div>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Delete Tenant</p>
              <p className="text-sm text-muted-foreground">Permanently remove this store and all its data</p>
            </div>
            <Button variant="destructive" onClick={handleDelete} className="gap-2">
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2 px-6">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
