"use client";

import { useState, useEffect } from "react";
import { Send, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product, Participant } from "./types";
import { getErrorMessage } from "./types";

interface TransferWholesalerDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadWholesalers: (product: Product) => Promise<Participant[]>;
  onTransfer: (product: Product, wholesalerAddress: string, wholesalers: Participant[]) => Promise<void>;
}

export function TransferWholesalerDialog({
  product,
  open,
  onOpenChange,
  onLoadWholesalers,
  onTransfer,
}: TransferWholesalerDialogProps) {
  const [wholesalers, setWholesalers] = useState<Participant[]>([]);
  const [selectedWholesaler, setSelectedWholesaler] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && product) {
      setError(null);
      setSelectedWholesaler("");
      setLoadingList(true);
      onLoadWholesalers(product)
        .then(setWholesalers)
        .catch((err) => {
          setWholesalers([]);
          setError(getErrorMessage(err));
        })
        .finally(() => setLoadingList(false));
    }
  }, [open, product, onLoadWholesalers]);

  const handleTransfer = async () => {
    if (!product || !selectedWholesaler) return;
    setLoading(true);
    setError(null);
    try {
      await onTransfer(product, selectedWholesaler, wholesalers);
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
    setSelectedWholesaler("");
    setWholesalers([]);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer to Wholesaler</DialogTitle>
          <DialogDescription>
            {product
              ? `Transfer "${product.name}" (${product.productCode}) to a registered wholesaler on-chain.`
              : "Select a wholesaler to transfer this product to."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loadingList ? (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading wholesalers...
            </p>
          ) : wholesalers.length === 0 && !error ? (
            <p className="text-sm text-muted-foreground">
              No active wholesalers found. Ensure wholesalers are registered and approved first.
            </p>
          ) : wholesalers.length > 0 ? (
            <>
              <div>
                <Label className="mb-1 block">Select Wholesaler</Label>
                <Select value={selectedWholesaler} onValueChange={setSelectedWholesaler}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a wholesaler..." />
                  </SelectTrigger>
                  <SelectContent>
                    {wholesalers.map((w) => (
                      <SelectItem key={w.address} value={w.address}>
                        {w.name} ({w.address.slice(0, 6)}...{w.address.slice(-4)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                This will call transferToWholesaler on-chain via MetaMask and update the database.
              </p>
            </>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            {wholesalers.length > 0 && (
              <Button onClick={handleTransfer} disabled={loading || !selectedWholesaler}>
                {loading ? (
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
  );
}
