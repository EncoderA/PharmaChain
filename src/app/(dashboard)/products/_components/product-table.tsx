"use client";

import { Eye, Send, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import type { Product } from "./types";
import { STATUS_CONFIG, getStockStatus, formatDate } from "./types";

interface UserInfo {
  id: number;
  role: string;
}

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  user: UserInfo | null;
  onViewDetails: (product: Product) => void;
  onTransferDistributor: (product: Product, e: React.MouseEvent) => void;
  onTransferWholesaler: (product: Product, e: React.MouseEvent) => void;
  onTransferPharmacist: (product: Product, e: React.MouseEvent) => void;
  onSellConsumer: (product: Product, e: React.MouseEvent) => void;
}

function StatusBadge({ status }: { status: Product["status"] }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 w-fit ${config.className || ""}`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}

export function ProductTable({
  products,
  loading,
  user,
  onViewDetails,
  onTransferDistributor,
  onTransferWholesaler,
  onTransferPharmacist,
  onSellConsumer,
}: ProductTableProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Inventory</CardTitle>
        <CardDescription>
          {products.length} product{products.length !== 1 ? "s" : ""} found
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading products...
                  </td>
                </tr>
              ) : (
                products.map((product) => {
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
                        <StatusBadge status={product.status} />
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onViewDetails(product);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {/* Transfer to Distributor — manufacturer only */}
                          {user?.role === "manufacturer" &&
                            product.status === "Verified" &&
                            product.manufacturerId === user.id && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => onTransferDistributor(product, e)}
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

                          {/* Transfer to Wholesaler — distributor only */}
                          {user?.role === "distributor" &&
                            product.status === "Verified" &&
                            product.currentOwnerId === user.id && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => onTransferWholesaler(product, e)}
                                    >
                                      <Send className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Transfer to Wholesaler</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}

                          {/* Transfer to Pharmacist — wholesaler only */}
                          {user?.role === "wholesaler" &&
                            product.status === "Verified" &&
                            product.currentOwnerId === user.id && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => onTransferPharmacist(product, e)}
                                    >
                                      <Send className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Transfer to Pharmacist</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}

                          {/* Sell to Consumer — pharmacist only */}
                          {user?.role === "pharmacist" &&
                            product.status === "Verified" &&
                            product.currentOwnerId === user.id &&
                            product.stock > 0 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => onSellConsumer(product, e)}
                                    >
                                      <ShoppingBag className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Sell to Consumer</p>
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

        {!loading && products.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No products found matching your criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
