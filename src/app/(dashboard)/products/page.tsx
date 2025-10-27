"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Product {
  id: string;
  name: string;
  manufacturer: string;
  batch: string;
  stock: number;
  status: "Verified" | "Pending" | "Expired";
  timestamp: string;
  hash: string;
  expiryDate: string;
  category: string;
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const products: Product[] = [
    {
      id: "PRD-001",
      name: "Paracetamol 500mg",
      manufacturer: "PharmaChain Labs",
      batch: "BATCH-A123",
      stock: 120,
      status: "Verified",
      timestamp: "2025-10-25 10:45 AM",
      hash: "0x9f2a86d4c8b3e1a7f5d2e8c4b7a9e3d1f6c8a2b4",
      expiryDate: "2026-10-25",
      category: "Analgesic",
    },
    {
      id: "PRD-002",
      name: "Amoxicillin 250mg",
      manufacturer: "WellCure Pharma",
      batch: "BATCH-B298",
      stock: 80,
      status: "Verified",
      timestamp: "2025-10-23 02:12 PM",
      hash: "0x8a3d7f2e1c9b6a4d8e5f3a2b1c7d9e4f6a8b3c1",
      expiryDate: "2026-08-15",
      category: "Antibiotic",
    },
    {
      id: "PRD-003",
      name: "Vitamin C 1000mg",
      manufacturer: "NutraHealth Inc",
      batch: "BATCH-C456",
      stock: 200,
      status: "Pending",
      timestamp: "2025-10-26 09:30 AM",
      hash: "0x7b4c9e2a8d6f1c3a5b9e7d2f4a8c6b3e1d5f9a2",
      expiryDate: "2027-01-20",
      category: "Supplement",
    },
    {
      id: "PRD-004",
      name: "Ibuprofen 400mg",
      manufacturer: "MediCare Solutions",
      batch: "BATCH-D789",
      stock: 45,
      status: "Expired",
      timestamp: "2025-09-15 03:45 PM",
      hash: "0x6c3a8d2f9e1b7a4c6d8f2e5a9b3c7e1d4f8a2b6",
      expiryDate: "2025-09-10",
      category: "Anti-inflammatory",
    },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Product["status"]) => {
    const statusConfig = {
      Verified: { variant: "default" as const, icon: CheckCircle },
      Pending: { variant: "secondary" as const, icon: AlertCircle },
      Expired: { variant: "destructive" as const, icon: AlertCircle },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return { label: "Out of Stock", className: "text-red-600" };
    if (stock < 50) return { label: "Low Stock", className: "text-orange-600" };
    return { label: "In Stock", className: "text-green-600" };
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleExportData = () => {
    // In a real app, this would generate a CSV file
    console.log("Exporting products data...");
  };

  return (
    <div className="flex-1 p-6 bg-background text-foreground space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-2">
            Manage and verify all pharmaceutical products registered on the
            blockchain
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 rounded-lg">
                <Plus />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Fill in the details of the new product.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div>
                  <Label className="mb-1 block">Product Name</Label>
                  <Input placeholder="Enter product name" />
                </div>
                <div>
                  <Label className="mb-1 block">Batch Number</Label>
                  <Input placeholder="Enter batch number" />
                </div>
                <div>
                  <Label className="mb-1 block">Manufacturer</Label>
                  <Input placeholder="Enter manufacturer name" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Save Product</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {products.filter((p) => p.status === "Verified").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {products.filter((p) => p.status === "Pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {products.filter((p) => p.stock < 50).length}
            </div>
          </CardContent>
        </Card>
      </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products, manufacturers, batches..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="whitespace-nowrap">
                  <Filter className="h-4 w-4 mr-2" />
                  Status: {statusFilter === "all" ? "All" : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Verified")}>
                  Verified
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Pending")}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Expired")}>
                  Expired
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            {filteredProducts.length} product
            {filteredProducts.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Manufacturer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Batch
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Last Updated
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <tr
                      key={product.id}
                      className="border-b border-border hover:bg-muted/20"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {product.id}
                          </div>
                          <div className="text-xs text-blue-600">
                            {product.category}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {product.manufacturer}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">
                        {product.batch}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm">{product.stock} units</span>
                          <span className={`text-xs ${stockStatus.className}`}>
                            {stockStatus.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(product.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {product.timestamp}
                      </td>
                      <td className="px-4 py-3">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(product)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No products found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Details Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected product
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Product ID
                  </label>
                  <p className="text-sm">{selectedProduct.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="text-sm">{selectedProduct.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Manufacturer
                  </label>
                  <p className="text-sm">{selectedProduct.manufacturer}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Batch
                  </label>
                  <p className="text-sm font-mono">{selectedProduct.batch}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Stock
                  </label>
                  <p className="text-sm">{selectedProduct.stock} units</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Expiry Date
                  </label>
                  <p className="text-sm">{selectedProduct.expiryDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Category
                  </label>
                  <p className="text-sm">{selectedProduct.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(selectedProduct.status)}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Blockchain Hash
                </label>
                <p className="text-sm font-mono bg-muted p-2 rounded break-all">
                  {selectedProduct.hash}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </label>
                <p className="text-sm">{selectedProduct.timestamp}</p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedProduct(null)}
                >
                  Close
                </Button>
                <Button>Verify on Blockchain</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
