"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import type { Product } from "./types";
import { STATUS_CONFIG, formatDate } from "./types";

interface ProductDetailsDialogProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductDetailsDialog({ product, onClose }: ProductDetailsDialogProps) {
  const router = useRouter();

  if (!product) return null;

  const config = STATUS_CONFIG[product.status];
  const Icon = config.icon;

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription>
            Detailed information about the selected product
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Product Code
              </label>
              <p className="text-sm">{product.productCode}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <p className="text-sm">{product.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Manufacturer
              </label>
              <p className="text-sm">{product.manufacturerName ?? "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Batch
              </label>
              <p className="text-sm font-mono">{product.batch ?? "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Stock
              </label>
              <p className="text-sm">{product.stock} units</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Expiry Date
              </label>
              <p className="text-sm">{formatDate(product.expiryDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Category
              </label>
              <p className="text-sm">{product.category ?? "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <div className="mt-1">
                <Badge
                  variant={config.variant}
                  className={`flex items-center gap-1 w-fit ${config.className || ""}`}
                >
                  <Icon className="h-3 w-3" />
                  {product.status}
                </Badge>
              </div>
            </div>
            {product.onChainDrugId != null && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Blockchain Drug ID
                </label>
                <p className="text-sm font-mono">#{product.onChainDrugId}</p>
              </div>
            )}
          </div>
          {product.blockchainHash && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Blockchain Hash
              </label>
              <p className="text-sm font-mono bg-muted p-2 rounded break-all">
                {product.blockchainHash}
              </p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Last Updated
            </label>
            <p className="text-sm">{formatDate(product.updatedAt)}</p>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => router.push(`/products/${product.id}`)}>
              Full Details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
