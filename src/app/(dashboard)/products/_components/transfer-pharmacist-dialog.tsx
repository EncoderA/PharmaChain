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

interface TransferPharmacistDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadPharmacists: () => Promise<Participant[]>;
  onTransfer: (product: Product, pharmacistId: string, pharmacists: Participant[]) => Promise<void>;
}

export function TransferPharmacistDialog({
  product,
  open,
  onOpenChange,
  onLoadPharmacists,
  onTransfer,
}: TransferPharmacistDialogProps) {
  const [pharmacists, setPharmacists] = useState<Participant[]>([]);
  const [selectedPharmacist, setSelectedPharmacist] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && product) {
      setError(null);
      setSelectedPharmacist("");
      setLoadingList(true);
      onLoadPharmacists()
        .then(setPharmacists)
        .catch((err) => {
          setPharmacists([]);
          setError(getErrorMessage(err));
        })
        .finally(() => setLoadingList(false));
    }
  }, [open, product, onLoadPharmacists]);

  const handleTransfer = async () => {
    if (!product || !selectedPharmacist) return;
    setLoading(true);
    setError(null);
    try {
      await onTransfer(product, selectedPharmacist, pharmacists);
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
    setSelectedPharmacist("");
    setPharmacists([]);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer to Pharmacist</DialogTitle>
          <DialogDescription>
            {product
              ? `Transfer "${product.name}" (${product.productCode}) to a registered pharmacist.`
              : "Select a pharmacist to transfer this product to."}
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
              Loading pharmacists...
            </p>
          ) : pharmacists.length === 0 && !error ? (
            <p className="text-sm text-muted-foreground">
              No active pharmacists found. Ensure pharmacists are registered and approved first.
            </p>
          ) : pharmacists.length > 0 ? (
            <>
              <div>
                <Label className="mb-1 block">Select Pharmacist</Label>
                <Select value={selectedPharmacist} onValueChange={setSelectedPharmacist}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a pharmacist..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pharmacists.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                This is an off-chain transfer. It will update the database only — no MetaMask transaction required.
              </p>
            </>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            {pharmacists.length > 0 && (
              <Button onClick={handleTransfer} disabled={loading || !selectedPharmacist}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Transferring...
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
