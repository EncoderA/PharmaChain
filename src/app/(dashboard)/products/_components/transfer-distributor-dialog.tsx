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

interface TransferDistributorDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadDistributors: () => Promise<Participant[]>;
  onTransfer: (product: Product, distributorAddress: string, distributors: Participant[]) => Promise<void>;
}

export function TransferDistributorDialog({
  product,
  open,
  onOpenChange,
  onLoadDistributors,
  onTransfer,
}: TransferDistributorDialogProps) {
  const [distributors, setDistributors] = useState<Participant[]>([]);
  const [selectedDistributor, setSelectedDistributor] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && product) {
      setError(null);
      setSelectedDistributor("");
      setLoadingList(true);
      onLoadDistributors()
        .then(setDistributors)
        .catch((err) => {
          setDistributors([]);
          setError(getErrorMessage(err));
        })
        .finally(() => setLoadingList(false));
    }
  }, [open, product, onLoadDistributors]);

  const handleTransfer = async () => {
    if (!product || !selectedDistributor) return;
    setLoading(true);
    setError(null);
    try {
      await onTransfer(product, selectedDistributor, distributors);
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
    setSelectedDistributor("");
    setDistributors([]);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer to Distributor</DialogTitle>
          <DialogDescription>
            {product
              ? `Transfer "${product.name}" (${product.productCode}) to a registered distributor on-chain.`
              : "Select a distributor to transfer this product to."}
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
              Loading distributors...
            </p>
          ) : distributors.length === 0 && !error ? (
            <p className="text-sm text-muted-foreground">
              No distributors registered under your account. Add distributors from the Users page first.
            </p>
          ) : distributors.length > 0 ? (
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
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            {distributors.length > 0 && (
              <Button onClick={handleTransfer} disabled={loading || !selectedDistributor}>
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
