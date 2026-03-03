"use client";

import { useState, useEffect, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  Send,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
<<<<<<< HEAD
import { DataTable } from "@/components/ui/data-table";
=======
import { useSupplyChainContract } from "@/hooks/use-supply-chain-contract";
>>>>>>> 196c0ac (on-chain off-chain connection)

interface Product {
  id: number;
  productCode: string;
  name: string;
  category: string | null;
  batch: string | null;
  stock: number;
  status: "Verified" | "Pending" | "Expired";
  manufacturerId: number | null;
  currentOwnerId: number | null;
  onChainDrugId: number | null;
  manufacturingDate: string | null;
  expiryDate: string | null;
  blockchainHash: string | null;
  createdAt: string;
  updatedAt: string;
  manufacturerName: string | null;
}

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

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferProduct, setTransferProduct] = useState<Product | null>(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [distributors, setDistributors] = useState<{ address: string; name: string; id: number }[]>([]);
  const [selectedDistributor, setSelectedDistributor] = useState("");
  const router = useRouter();
  const { user } = useUser();
  const {
    registerDrug,
    getDrugCounter,
    transferToDistributor,
    getMyDistributors,
  } = useSupplyChainContract();

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchTerm) params.set("search", searchTerm);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchProducts]);

  const filteredProducts = products;

  const handleViewDetails = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProduct(product);
  };

  const handleExportData = () => {
    const csvRows = [
      ["Product Code", "Name", "Manufacturer", "Batch", "Stock", "Status", "Category", "Expiry Date"].join(","),
      ...products.map((p) =>
        [
          p.productCode,
          p.name,
          p.manufacturerName ?? "",
          p.batch ?? "",
          p.stock,
          p.status,
          p.category ?? "",
          p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : "",
        ].join(",")
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const productCode = formData.get("productCode") as string;
    const batch = formData.get("batch") as string;
    const category = formData.get("category") as string;
    const stock = parseInt(formData.get("stock") as string) || 0;
    const expiryDateStr = formData.get("expiryDate") as string;
    const manufacturingDateStr = formData.get("manufacturingDate") as string;

    if (!name || !productCode) {
      setAddError("Product name and code are required");
      setAddLoading(false);
      return;
    }

    try {
      // Convert dates to Unix timestamps (seconds) for the smart contract
      const mfgTimestamp = manufacturingDateStr
        ? Math.floor(new Date(manufacturingDateStr).getTime() / 1000)
        : Math.floor(Date.now() / 1000);
      const expTimestamp = expiryDateStr
        ? Math.floor(new Date(expiryDateStr).getTime() / 1000)
        : mfgTimestamp + 365 * 24 * 60 * 60; // default: 1 year from mfg

      if (expTimestamp <= mfgTimestamp) {
        setAddError("Expiry date must be after manufacturing date");
        setAddLoading(false);
        return;
      }

      // Step 1: Register on-chain via MetaMask
      const { txHash, blockNumber } = await registerDrug(name, mfgTimestamp, expTimestamp);

      // Step 2: Get the on-chain drug ID (the counter after registration)
      const drugId = await getDrugCounter();

      // Step 3: Save to database
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          productCode,
          batch: batch || undefined,
          category: category || undefined,
          stock,
          manufacturingDate: manufacturingDateStr || new Date().toISOString(),
          expiryDate: expiryDateStr || undefined,
          blockchainHash: txHash,
          status: "Verified",
          onChainDrugId: Number(drugId),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save product to database");
      }

      const product = await res.json();

      // Step 4: Record the transaction
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          action: "Manufactured",
          fromUserId: user?.id,
          txHash,
          blockNumber,
          status: "Confirmed",
        }),
      });

      setAddDialogOpen(false);
      fetchProducts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.includes("user rejected") || message.includes("ACTION_REJECTED")) {
        setAddError("MetaMask transaction was rejected.");
      } else {
        setAddError(message);
      }
    } finally {
      setAddLoading(false);
    }
  };

  const canAddProducts = user?.role === "manufacturer" || user?.role === "admin";

<<<<<<< HEAD
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div>
            <div className="font-medium">{product.name}</div>
            <div className="text-xs text-muted-foreground">
              {product.productCode}
            </div>
            {product.category && (
              <div className="text-xs text-primary">{product.category}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "manufacturerName",
      header: "Manufacturer",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.manufacturerName ?? "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "batch",
      header: "Batch",
      cell: ({ row }) => (
        <span className="text-sm font-mono">
          {row.original.batch ?? "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const stockStatus = getStockStatus(row.original.stock);
        return (
          <div className="flex flex-col">
            <span className="text-sm">{row.original.stock} units</span>
            <span className={`text-xs ${stockStatus.className}`}>
              {stockStatus.label}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.updatedAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "View Details",
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleViewDetails(row.original, e)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
  ];
=======
  // Load distributors under this manufacturer when transfer dialog opens
  const openTransferDialog = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setTransferProduct(product);
    setTransferError(null);
    setSelectedDistributor("");
    setTransferDialogOpen(true);

    try {
      // Get on-chain distributor addresses
      const addresses = await getMyDistributors();

      // Match against DB users for names
      const res = await fetch("/api/user");
      if (res.ok) {
        const dbUsers: { id: number; fullName: string; walletId: string; role: string; status: string }[] = await res.json();
        const matched = addresses.map((addr) => {
          const dbUser = dbUsers.find(
            (u) => u.walletId.toLowerCase() === addr.toLowerCase() && u.status === "active"
          );
          return {
            address: addr,
            name: dbUser?.fullName ?? `${addr.slice(0, 6)}...${addr.slice(-4)}`,
            id: dbUser?.id ?? 0,
          };
        });
        setDistributors(matched);
      }
    } catch {
      setDistributors([]);
    }
  };

  const handleTransferToDistributor = async () => {
    if (!transferProduct || !selectedDistributor) return;
    setTransferLoading(true);
    setTransferError(null);

    try {
      const distributor = distributors.find((d) => d.address === selectedDistributor);
      if (!distributor) throw new Error("Select a distributor");

      if (!transferProduct.blockchainHash) {
        throw new Error("This product was not registered on-chain. Cannot transfer.");
      }

      // Use stored on-chain drug ID if available, otherwise scan the chain
      let onChainDrugId: number | null = transferProduct.onChainDrugId ?? null;

      if (onChainDrugId === null) {
        const { getSupplyChainContract } = await import("@/blockchain/contract");
        const contract = await getSupplyChainContract();
        const counter = await contract.drugCounter();

        for (let i = Number(counter); i >= 1; i--) {
          const drug = await contract.getDrugDetails(i);
          if (
            drug.name === transferProduct.name &&
            Number(drug.stage) === 0 && // Manufactured stage
            !drug.isRejected
          ) {
            onChainDrugId = i;
            break;
          }
        }
      }

      if (onChainDrugId === null) {
        throw new Error("Could not find this drug on-chain in Manufactured stage.");
      }

      // Step 1: Transfer on-chain
      const { txHash, blockNumber } = await transferToDistributor(onChainDrugId, distributor.address);

      // Step 2: Update product in DB — change currentOwnerId
      await fetch(`/api/products/${transferProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentOwnerId: distributor.id || undefined,
          status: "Verified",
        }),
      });

      // Step 3: Record transaction
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: transferProduct.id,
          action: "Distributed",
          fromUserId: user?.id,
          toUserId: distributor.id || undefined,
          txHash,
          blockNumber,
          status: "Confirmed",
        }),
      });

      setTransferDialogOpen(false);
      setTransferProduct(null);
      fetchProducts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.includes("user rejected") || message.includes("ACTION_REJECTED")) {
        setTransferError("MetaMask transaction was rejected.");
      } else {
        setTransferError(message);
      }
    } finally {
      setTransferLoading(false);
    }
  };
>>>>>>> 196c0ac (on-chain off-chain connection)

  return (
    <div className="flex-1 p-6 bg-background text-foreground space-y-6">

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
          {canAddProducts && (
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
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
                <form onSubmit={handleAddProduct} className="space-y-4 mt-4">
                  {addError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{addError}</AlertDescription>
                    </Alert>
                  )}
                  <div>
                    <Label className="mb-1 block">Product Code</Label>
                    <Input name="productCode" placeholder="e.g. PRD-005" required />
                  </div>
                  <div>
                    <Label className="mb-1 block">Product Name</Label>
                    <Input name="name" placeholder="Enter product name" required />
                  </div>
                  <div>
                    <Label className="mb-1 block">Category</Label>
                    <Input name="category" placeholder="e.g. Analgesic" />
                  </div>
                  <div>
                    <Label className="mb-1 block">Batch Number</Label>
                    <Input name="batch" placeholder="e.g. BATCH-A123" />
                  </div>
                  <div>
                    <Label className="mb-1 block">Stock</Label>
                    <Input name="stock" type="number" placeholder="0" defaultValue={0} />
                  </div>
                  <div>
                    <Label className="mb-1 block">Manufacturing Date</Label>
                    <Input name="manufacturingDate" type="date" />
                  </div>
                  <div>
                    <Label className="mb-1 block">Expiry Date</Label>
                    <Input name="expiryDate" type="date" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This will register the drug on-chain via MetaMask and save it to the database.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)} disabled={addLoading}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addLoading}>
                      {addLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Registering on-chain...
                        </>
                      ) : (
                        "Register Product"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
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
            <div className="text-2xl font-bold">
              {loading ? "..." : products.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? "..." : products.filter((p) => p.status === "Verified").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {loading ? "..." : products.filter((p) => p.status === "Pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loading ? "..." : products.filter((p) => p.stock < 50).length}
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
<<<<<<< HEAD
        <CardContent>
          {loading ? (
=======
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
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading products...
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    return (
                      <tr
                        key={product.id}
                        className="border-b border-border cursor-pointer hover:bg-muted/20"
                        onClick={() => router.push(`/products/${product.id}`)}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {product.productCode}
                            </div>
                            {product.category && (
                              <div className="text-xs text-primary">
                                {product.category}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {product.manufacturerName ?? "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono">
                          {product.batch ?? "N/A"}
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
                          {formatDate(product.updatedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleViewDetails(product, e)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View Details</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {/* Transfer to Distributor — manufacturer only, Verified products */}
                            {user?.role === "manufacturer" &&
                              product.status === "Verified" &&
                              product.manufacturerId === user.id && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => openTransferDialog(product, e)}
                                      >
                                        <Send className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Transfer to Distributor</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredProducts.length === 0 && (
>>>>>>> 196c0ac (on-chain off-chain connection)
            <div className="text-center py-8 text-muted-foreground">
              Loading products...
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredProducts}
              onRowClick={(product) => router.push(`/products/${product.id}`)}
            />
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
                    Product Code
                  </label>
                  <p className="text-sm">{selectedProduct.productCode}</p>
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
                  <p className="text-sm">{selectedProduct.manufacturerName ?? "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Batch
                  </label>
                  <p className="text-sm font-mono">{selectedProduct.batch ?? "N/A"}</p>
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
                  <p className="text-sm">{formatDate(selectedProduct.expiryDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Category
                  </label>
                  <p className="text-sm">{selectedProduct.category ?? "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(selectedProduct.status)}
                  </div>
                </div>
                {selectedProduct.onChainDrugId != null && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Blockchain Drug ID
                    </label>
                    <p className="text-sm font-mono">#{selectedProduct.onChainDrugId}</p>
                  </div>
                )}
              </div>
              {selectedProduct.blockchainHash && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Blockchain Hash
                  </label>
                  <p className="text-sm font-mono bg-muted p-2 rounded break-all">
                    {selectedProduct.blockchainHash}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </label>
                <p className="text-sm">{formatDate(selectedProduct.updatedAt)}</p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedProduct(null)}
                >
                  Close
                </Button>
                <Button onClick={() => router.push(`/products/${selectedProduct.id}`)}>
                  Full Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transfer to Distributor Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setTransferDialogOpen(false);
          setTransferProduct(null);
          setTransferError(null);
          setSelectedDistributor("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer to Distributor</DialogTitle>
            <DialogDescription>
              {transferProduct
                ? `Transfer "${transferProduct.name}" (${transferProduct.productCode}) to a registered distributor on-chain.`
                : "Select a distributor to transfer this product to."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {transferError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{transferError}</AlertDescription>
              </Alert>
            )}

            {distributors.length === 0 && !transferError ? (
              <p className="text-sm text-muted-foreground">
                No distributors registered under your account. Add distributors from the Users page first.
              </p>
            ) : (
              <>
                <div>
                  <Label className="mb-1 block">Select Distributor</Label>
                  <Select value={selectedDistributor} onValueChange={setSelectedDistributor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a distributor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {distributors.map((d) => (
                        <SelectItem key={d.address} value={d.address}>
                          {d.name} ({d.address.slice(0, 6)}...{d.address.slice(-4)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  This will call transferToDistributor on-chain via MetaMask and update the database.
                </p>
              </>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTransferDialogOpen(false);
                  setTransferProduct(null);
                }}
                disabled={transferLoading}
              >
                Cancel
              </Button>
              {distributors.length > 0 && (
                <Button
                  onClick={handleTransferToDistributor}
                  disabled={transferLoading || !selectedDistributor}
                >
                  {transferLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Transferring on-chain...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Transfer
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
