"use client";

import { useEffect, useState } from "react";
import { Factory, Truck, Store, Building2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, AlertCircle } from "lucide-react";
import { BackButton } from "@/components/products/back-button";
import { CopyButton } from "@/components/products/copy-button";
import { ViewTransactionButton } from "@/components/products/view-transaction-button";
import { useParams } from "next/navigation";

interface ProductDetail {
  id: number;
  productCode: string;
  name: string;
  category: string | null;
  batch: string | null;
  stock: number;
  status: "Verified" | "Pending" | "Expired";
  manufacturerId: number | null;
  currentOwnerId: number | null;
  manufacturingDate: string | null;
  expiryDate: string | null;
  blockchainHash: string | null;
  createdAt: string;
  updatedAt: string;
  manufacturerName: string | null;
  manufacturerOrg: string | null;
}

interface Transaction {
  id: number;
  productId: number | null;
  action: string;
  fromUserId: number | null;
  toUserId: number | null;
  txHash: string | null;
  blockNumber: number | null;
  status: "Confirmed" | "Pending" | "Failed";
  createdAt: string;
  productName: string | null;
  productCode: string | null;
  fromUserName: string | null;
  toUserName: string | null;
}

const stageIcons: Record<string, typeof Factory> = {
  Manufactured: Factory,
  Distributed: Truck,
  Wholesaled: Building2,
  Sold: Store,
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.productId as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productRes, txRes] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch(`/api/transactions?productId=${productId}`),
        ]);

        if (!productRes.ok) {
          const data = await productRes.json();
          throw new Error(data.error || "Product not found");
        }

        const productData = await productRes.json();
        setProduct(productData);

        if (txRes.ok) {
          const txData = await txRes.json();
          setTransactions(txData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [productId]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === "Verified" || status === "Confirmed") {
      return (
        <Badge className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          {status}
        </Badge>
      );
    }
    if (status === "Expired" || status === "Failed") {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {status}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 bg-background">
        <div className="flex items-center gap-4 mb-6">
          <BackButton />
        </div>
        <div className="text-center py-12 text-muted-foreground">
          Loading product details...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex-1 p-6 bg-background">
        <div className="flex items-center gap-4 mb-6">
          <BackButton />
        </div>
        <div className="text-center py-12 text-destructive">
          {error || "Product not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-background space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <BackButton />
      </div>

      {/* Product Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{product.name}</CardTitle>
              <CardDescription className="mt-2">
                Product Code: {product.productCode}
                {product.batch && ` | Batch: ${product.batch}`}
              </CardDescription>
            </div>
            {getStatusBadge(product.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Manufacturer
              </label>
              <p className="text-sm mt-1">{product.manufacturerName ?? "N/A"}</p>
              {product.manufacturerOrg && (
                <p className="text-xs text-muted-foreground">{product.manufacturerOrg}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Category
              </label>
              <p className="text-sm mt-1">{product.category ?? "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Stock Available
              </label>
              <p className="text-sm mt-1">{product.stock} units</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Manufacturing Date
              </label>
              <p className="text-sm mt-1">{formatDate(product.manufacturingDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Expiry Date
              </label>
              <p className="text-sm mt-1">{formatDate(product.expiryDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Last Updated
              </label>
              <p className="text-sm mt-1">{formatDate(product.updatedAt)}</p>
            </div>
          </div>
          {product.blockchainHash && (
            <div className="mt-6">
              <label className="text-sm font-medium text-muted-foreground">
                Blockchain Hash
              </label>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm font-mono bg-muted p-2 rounded flex-1 break-all">
                  {product.blockchainHash}
                </p>
                <CopyButton text={product.blockchainHash} id="main" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supply Chain Timeline (from transactions) */}
      <Card>
        <CardHeader>
          <CardTitle>Supply Chain Timeline</CardTitle>
          <CardDescription>
            {transactions.length > 0
              ? "Track the journey of this product through the supply chain"
              : "No transactions recorded for this product yet"}
          </CardDescription>
        </CardHeader>
        {transactions.length > 0 && (
          <CardContent>
            <div className="relative">
              {transactions.map((tx, index) => {
                const Icon = stageIcons[tx.action] || User;
                const isLast = index === transactions.length - 1;
                const isCompleted = tx.status === "Confirmed";
                const isPending = tx.status === "Pending";

                return (
                  <div key={tx.id} className="flex gap-4 pb-8 relative">
                    {/* Icon */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? "bg-primary text-foreground"
                            : isPending
                            ? "bg-blue-500/20 text-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      {isCompleted && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      )}

                      {!isLast && (
                        <div className="absolute left-1/2 top-12 w-0.5 h-[calc(100%+2rem)] -translate-x-1/2 border-l-2 border-dashed border-border" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="bg-card border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-base">
                              {tx.action}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {tx.fromUserName ?? "Unknown"} → {tx.toUserName ?? "Unknown"}
                            </p>
                          </div>
                          {getStatusBadge(tx.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Timestamp:</span>
                            <span className="ml-2 font-medium">{formatDate(tx.createdAt)}</span>
                          </div>
                          {tx.blockNumber && (
                            <div>
                              <span className="text-muted-foreground">Block:</span>
                              <span className="ml-2 font-medium">#{tx.blockNumber.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                        {tx.txHash && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                Transaction Hash:
                              </span>
                              <code className="text-xs font-mono bg-muted px-2 py-1 rounded flex-1 truncate">
                                {tx.txHash}
                              </code>
                              <CopyButton text={tx.txHash} id={tx.txHash} />
                              <ViewTransactionButton txHash={tx.txHash} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
