"use client"

import { use, useState } from "react"
import { Search, Grid3X3, List, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface Product {
  id: string
  name: string
  sku: string
  price: number
  inventory: number
  status: "active" | "draft" | "archived"
  image: string
}

const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Classic White T-Shirt",
    sku: "TSH-001",
    price: 29.99,
    inventory: 150,
    status: "active",
    image: "/white-tshirt.png",
  },
  {
    id: "2",
    name: "Slim Fit Jeans",
    sku: "JNS-002",
    price: 79.99,
    inventory: 85,
    status: "active",
    image: "/classic-blue-jeans.png",
  },
  {
    id: "3",
    name: "Leather Belt",
    sku: "BLT-003",
    price: 45.0,
    inventory: 200,
    status: "active",
    image: "/leather-belt.png",
  },
  {
    id: "4",
    name: "Running Sneakers",
    sku: "SNK-004",
    price: 129.99,
    inventory: 45,
    status: "active",
    image: "/running-shoes.jpg",
  },
  {
    id: "5",
    name: "Wool Sweater",
    sku: "SWT-005",
    price: 89.99,
    inventory: 0,
    status: "draft",
    image: "/cozy-wool-sweater.png",
  },
  {
    id: "6",
    name: "Canvas Backpack",
    sku: "BAG-006",
    price: 65.0,
    inventory: 120,
    status: "active",
    image: "/canvas-backpack.png",
  },
]

export default function ProductsPage({ params }: { params: Promise<{ tenantId: string }> }) {
  use(params)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredProducts = sampleProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusConfig = (status: Product["status"]) => {
    switch (status) {
      case "active":
        return { className: "bg-success/10 text-success" }
      case "draft":
        return { className: "bg-warning/10 text-warning" }
      case "archived":
        return { className: "bg-muted text-muted-foreground" }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const statusConfig = getStatusConfig(product.status)
                return (
                  <div
                    key={product.id}
                    className="p-4 rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex gap-4">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover bg-muted"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">{product.sku}</p>
                        <p className="text-base font-semibold text-primary mt-1">${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <Badge variant="outline" className={statusConfig.className}>
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{product.inventory} in stock</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => {
                const statusConfig = getStatusConfig(product.status)
                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover bg-muted"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">{product.sku}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="font-medium text-foreground">${product.price.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{product.inventory} in stock</p>
                    </div>
                    <Badge variant="outline" className={statusConfig.className}>
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
