"use client"

import { use, useCallback, useEffect, useMemo, useState } from "react"
import { Search, Grid3X3, List, Plus, RefreshCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createProduct, getProducts, type ProductRecord } from "@/lib/api"
import { useStore } from "@/lib/store"

type ViewMode = "grid" | "list"

export default function ProductsPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = use(params)
  const token = useStore((state) => state.token)
  const [products, setProducts] = useState<ProductRecord[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title: "", price: "", shopProductId: "" })
  const { toast } = useToast()

  const loadProducts = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const data = await getProducts(tenantId, token)
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [tenantId, token])

  useEffect(() => {
    if (!token) return
    void loadProducts()
  }, [loadProducts, token])

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return products.filter((product) =>
      product.title.toLowerCase().includes(query) || String(product.shopProductId).includes(query),
    )
  }, [products, searchQuery])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)

  const handleCreateProduct = async () => {
    if (!token) {
      toast({ title: "Authentication required", description: "Log in again to continue", variant: "destructive" })
      return
    }
    const trimmedTitle = form.title.trim()
    const numericPrice = Number(form.price)
    if (!trimmedTitle || Number.isNaN(numericPrice) || numericPrice <= 0) {
      toast({
        title: "Invalid details",
        description: "Enter a product name and a price greater than zero.",
        variant: "destructive",
      })
      return
    }
    const shopProductId = form.shopProductId ? Number(form.shopProductId) : undefined
    if (shopProductId !== undefined && Number.isNaN(shopProductId)) {
      toast({
        title: "Invalid Shopify product id",
        description: "Enter a numeric Shopify product id or leave it blank to auto-generate.",
        variant: "destructive",
      })
      return
    }
    try {
      setSubmitting(true)
      await createProduct(
        tenantId,
        {
          title: trimmedTitle,
          price: numericPrice,
          shopProductId,
        },
        token,
      )
      toast({ title: "Product added", description: `${trimmedTitle} is now in this catalog.` })
      setDialogOpen(false)
      setForm({ title: "", price: "", shopProductId: "" })
      await loadProducts()
    } catch (err) {
      toast({
        title: "Unable to add product",
        description: err instanceof Error ? err.message : "Try again in a moment.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const renderBadge = (product: ProductRecord) => (
    <Badge variant="outline">#{product.shopProductId}</Badge>
  )

  if (!token) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Products</h1>
          <p className="text-muted-foreground">Tenant-specific catalog sourced from Shopify syncs or manual adds.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadProducts()} disabled={loading} className="gap-2">
            <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or Shopify product id"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-1">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="h-20 rounded-lg bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg font-medium text-foreground mb-2">No products found</p>
              <p className="text-muted-foreground">Try syncing the tenant or add a product manually.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-4 rounded-lg border border-border hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{product.title}</h4>
                      <p className="text-sm text-muted-foreground">Added {new Date(product.createdAt).toLocaleDateString()}</p>
                    </div>
                    {renderBadge(product)}
                  </div>
                  <p className="text-2xl font-semibold text-primary mt-4">{formatCurrency(product.price)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{product.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(product.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(product.price)}</p>
                    <p className="text-xs text-muted-foreground">Last updated {new Date(product.updatedAt || product.createdAt).toLocaleDateString()}</p>
                  </div>
                  {renderBadge(product)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>Manually add a product to this tenant or reserve an id for future Shopify syncs.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Name</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Aurora Velvet Sofa"
              />
            </div>
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="1899.00"
              />
            </div>
            <div>
              <Label htmlFor="shopProductId">Shopify product id (optional)</Label>
              <Input
                id="shopProductId"
                value={form.shopProductId}
                onChange={(e) => setForm((prev) => ({ ...prev, shopProductId: e.target.value }))}
                placeholder="Auto-generate if blank"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleCreateProduct} disabled={submitting} className="gap-2">
              {submitting && <span className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />}
              Save Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
