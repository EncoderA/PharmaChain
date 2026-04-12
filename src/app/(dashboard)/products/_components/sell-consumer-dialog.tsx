"use client";

import { useState } from "react";
import { ShoppingBag, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "./types";
import { getErrorMessage } from "./types";

interface SellConsumerDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSell: (product: Product, formData: FormData) => Promise<void>;
}

export function SellConsumerDialog({
  product,
  open,
  onOpenChange,
  onSell,
}: SellConsumerDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      await onSell(product, formData);
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sell to Consumer</DialogTitle>
          <DialogDescription>
            {product
              ? `Sell "${product.name}" (${product.productCode}) to an end consumer. Available stock: ${product.stock} units.`
              : "Fill in consumer details to complete the sale."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div>
            <Label className="mb-1 block">Consumer Name *</Label>
            <Input name="consumerName" placeholder="Enter consumer's full name" required />
          </div>
          <div>
            <Label className="mb-1 block">Consumer Phone</Label>
            <Input name="consumerPhone" placeholder="e.g. 9876543210" />
          </div>
          <div>
            <Label className="mb-1 block">Consumer Address</Label>
            <Input name="consumerAddress" placeholder="Enter consumer's address" />
          </div>
          <div>
            <Label className="mb-1 block">Quantity</Label>
            <Input
              name="quantity"
              type="number"
              min={1}
              max={product?.stock || 1}
              defaultValue={1}
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            This will record the sale in the database and update the stock.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing sale...
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Confirm Sale
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
