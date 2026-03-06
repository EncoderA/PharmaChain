"use client";

import { useEffect, useState } from "react";
import { Factory, Truck, Store, Building2, User, Loader2, XCircle, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { BackButton } from "@/components/products/back-button";
import { CopyButton } from "@/components/products/copy-button";
import { ViewTransactionButton } from "@/components/products/view-transaction-button";
import { useParams } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { useSupplyChainContract } from "@/hooks/use-supply-chain-contract";

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
  onChainDrugId: number | null;
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
  Rejected: XCircle,
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.productId as string;
  const { user } = useUser();
  const {
    rejectDrug,
    transferToDistributor,
    transferToWholesaler,
    markAsSold,
    getMyDistributors,
    getMyWholesalers,
    getDrugDetails,
  } = useSupplyChainContract();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onChainQrHash, setOnChainQrHash] = useState<string | null>(null);

  // Reject state
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Transfer to Distributor state (manufacturer)
  const [transferDistDialogOpen, setTransferDistDialogOpen] = useState(false);
  const [transferDistLoading, setTransferDistLoading] = useState(false);
  const [transferDistError, setTransferDistError] = useState<string | null>(null);
  const [distributors, setDistributors] = useState<{ address: string; name: string; id: number }[]>([]);
  const [selectedDistributor, setSelectedDistributor] = useState("");

  // Transfer to Wholesaler state (distributor)
  const [transferWholDialogOpen, setTransferWholDialogOpen] = useState(false);
  const [transferWholLoading, setTransferWholLoading] = useState(false);
  const [transferWholError, setTransferWholError] = useState<string | null>(null);
  const [wholesalers, setWholesalers] = useState<{ address: string; name: string; id: number }[]>([]);
  const [selectedWholesaler, setSelectedWholesaler] = useState("");

  // Mark as Sold state (pharmacist/wholesaler)
  const [soldLoading, setSoldLoading] = useState(false);
  const [soldError, setSoldError] = useState<string | null>(null);

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

  /** Fetch the on-chain QR hash when the product has an onChainDrugId */
  useEffect(() => {
    if (!product?.onChainDrugId) return;

    let cancelled = false;
    const fetchQrHash = async () => {
      try {
        const drug = await getDrugDetails(product.onChainDrugId!);
        if (!cancelled) {
          setOnChainQrHash(drug.qrHash);
        }
      } catch {
        // silently fail — QR hash is supplementary
      }
    };
    fetchQrHash();
    return () => { cancelled = true; };
  }, [product?.onChainDrugId, getDrugDetails]);

  /** Find the on-chain drug ID — use stored DB value if available, otherwise scan chain. */
  const findOnChainDrugId = async (productName: string, stage?: number): Promise<number> => {
    // Use stored on-chain drug ID if available
    if (product?.onChainDrugId != null) {
      return product.onChainDrugId;
    }

    const { getSupplyChainContract } = await import("@/blockchain/contract");
    const contract = await getSupplyChainContract();
    const counter = await contract.drugCounter();

    for (let i = Number(counter); i >= 1; i--) {
      const drug = await contract.getDrugDetails(i);
      const matchesStage = stage !== undefined ? Number(drug.stage) === stage : true;
      if (drug.name === productName && matchesStage && !drug.isRejected) {
        return i;
      }
    }
    throw new Error("Could not find this drug on-chain.");
  };

  /** Reject this drug on-chain + update DB */
  const handleRejectDrug = async () => {
    if (!product) return;
    setRejectLoading(true);
    setRejectError(null);
    try {
      if (!product.blockchainHash) {
        throw new Error("This product was not registered on-chain.");
      }

      // Find the on-chain drug ID (any non-rejected drug with this name)
      const onChainDrugId = await findOnChainDrugId(product.name);

      // Step 1: Reject on-chain
      const { txHash, blockNumber } = await rejectDrug(onChainDrugId);

      // Step 2: Update product status in DB
      await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Expired" }),
      });

      // Step 3: Record transaction
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          action: "Rejected",
          fromUserId: user?.id,
          txHash,
          blockNumber,
          status: "Confirmed",
        }),
      });

      // Refresh data
      setProduct((prev) => prev ? { ...prev, status: "Expired" as const } : prev);
      const txRes = await fetch(`/api/transactions?productId=${productId}`);
      if (txRes.ok) setTransactions(await txRes.json());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.includes("user rejected") || message.includes("ACTION_REJECTED")) {
        setRejectError("MetaMask transaction was rejected.");
      } else {
        setRejectError(message);
      }
    } finally {
      setRejectLoading(false);
    }
  };

  /** Open Transfer to Distributor dialog and load distributor list */
  const openTransferDistDialog = async () => {
    setTransferDistError(null);
    setSelectedDistributor("");
    setTransferDistDialogOpen(true);
    try {
      const addresses = await getMyDistributors();
      const res = await fetch("/api/user");
      if (res.ok) {
        const dbUsers: { id: number; fullName: string; walletId: string; status: string }[] = await res.json();
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

  /** Transfer to Distributor on-chain + DB */
  const handleTransferToDistributor = async () => {
    if (!product || !selectedDistributor) return;
    setTransferDistLoading(true);
    setTransferDistError(null);
    try {
      const distributor = distributors.find((d) => d.address === selectedDistributor);
      if (!distributor) throw new Error("Select a distributor");
      if (!product.blockchainHash) throw new Error("Product not registered on-chain.");

      const onChainDrugId = await findOnChainDrugId(product.name, 0); // Manufactured stage
      const { txHash, blockNumber } = await transferToDistributor(onChainDrugId, distributor.address);

      await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentOwnerId: distributor.id || undefined, status: "Verified" }),
      });

      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          action: "Distributed",
          fromUserId: user?.id,
          toUserId: distributor.id || undefined,
          txHash,
          blockNumber,
          status: "Confirmed",
        }),
      });

      setTransferDistDialogOpen(false);
      // Refresh
      const [pRes, txRes] = await Promise.all([
        fetch(`/api/products/${productId}`),
        fetch(`/api/transactions?productId=${productId}`),
      ]);
      if (pRes.ok) setProduct(await pRes.json());
      if (txRes.ok) setTransactions(await txRes.json());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.includes("user rejected") || message.includes("ACTION_REJECTED")) {
        setTransferDistError("MetaMask transaction was rejected.");
      } else {
        setTransferDistError(message);
      }
    } finally {
      setTransferDistLoading(false);
    }
  };

  /** Open Transfer to Wholesaler dialog and load wholesaler list */
  const openTransferWholDialog = async () => {
    setTransferWholError(null);
    setSelectedWholesaler("");
    setTransferWholDialogOpen(true);
    try {
      // Fetch active wholesaler users from DB, scoped to manufacturer hierarchy
      const res = await fetch("/api/user");
      if (res.ok) {
        const dbUsers: { id: number; fullName: string; walletId: string; role: string; status: string }[] = await res.json();
        let wholesalerList = dbUsers.filter(
          (u) => (u.role === "wholesaler" || u.role === "pharmacist") && u.status === "active" && u.walletId
        );

        // Scope wholesalers to the same manufacturer hierarchy.
        // Use the product's manufacturerId to scope wholesalers.
        const mfrId = product?.manufacturerId;
        if (mfrId) {
          const scoped = wholesalerList.filter((u) => u.id !== mfrId);
          if (scoped.length > 0) {
            wholesalerList = scoped;
          }
          // If no scoped wholesalers found, fall back to showing all active wholesalers
        }

        setWholesalers(
          wholesalerList.map((u) => ({
            address: u.walletId,
            name: u.fullName,
            id: u.id,
          }))
        );
      }
    } catch {
      setWholesalers([]);
    }
  };

  /** Transfer to Wholesaler on-chain + DB */
  const handleTransferToWholesaler = async () => {
    if (!product || !selectedWholesaler) return;
    setTransferWholLoading(true);
    setTransferWholError(null);
    try {
      const wholesaler = wholesalers.find((w) => w.address === selectedWholesaler);
      if (!wholesaler) throw new Error("Select a wholesaler/pharmacist");
      if (!product.blockchainHash) throw new Error("Product not registered on-chain.");

      const onChainDrugId = await findOnChainDrugId(product.name, 1); // Distributed stage
      const { txHash, blockNumber } = await transferToWholesaler(onChainDrugId, wholesaler.address);

      await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentOwnerId: wholesaler.id || undefined, status: "Verified" }),
      });

      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          action: "Wholesaled",
          fromUserId: user?.id,
          toUserId: wholesaler.id || undefined,
          txHash,
          blockNumber,
          status: "Confirmed",
        }),
      });

      setTransferWholDialogOpen(false);
      const [pRes, txRes] = await Promise.all([
        fetch(`/api/products/${productId}`),
        fetch(`/api/transactions?productId=${productId}`),
      ]);
      if (pRes.ok) setProduct(await pRes.json());
      if (txRes.ok) setTransactions(await txRes.json());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.includes("user rejected") || message.includes("ACTION_REJECTED")) {
        setTransferWholError("MetaMask transaction was rejected.");
      } else {
        setTransferWholError(message);
      }
    } finally {
      setTransferWholLoading(false);
    }
  };

  /** Mark drug as sold on-chain + DB (pharmacist/wholesaler) */
  const handleMarkAsSold = async () => {
    if (!product) return;
    setSoldLoading(true);
    setSoldError(null);
    try {
      if (!product.blockchainHash) throw new Error("Product not registered on-chain.");

      const onChainDrugId = await findOnChainDrugId(product.name, 2); // Wholesaled stage
      const { txHash, blockNumber } = await markAsSold(onChainDrugId);

      await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Verified" }),
      });

      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          action: "Sold",
          fromUserId: user?.id,
          txHash,
          blockNumber,
          status: "Confirmed",
        }),
      });

      // Refresh
      const [pRes, txRes] = await Promise.all([
        fetch(`/api/products/${productId}`),
        fetch(`/api/transactions?productId=${productId}`),
      ]);
      if (pRes.ok) setProduct(await pRes.json());
      if (txRes.ok) setTransactions(await txRes.json());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.includes("user rejected") || message.includes("ACTION_REJECTED")) {
        setSoldError("MetaMask transaction was rejected.");
      } else {
        setSoldError(message);
      }
    } finally {
      setSoldLoading(false);
    }
  };

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
      <div className="flex items-center justify-between">
        <BackButton />
        {/* Action buttons based on user role and product state */}
        {product.status !== "Expired" && product.blockchainHash && (
          <div className="flex items-center gap-2">
            {/* Manufacturer: Transfer to Distributor */}
            {user?.role === "manufacturer" &&
              product.manufacturerId === user.id &&
              product.currentOwnerId === user.id && (
                <Button variant="outline" onClick={openTransferDistDialog}>
                  <Send className="h-4 w-4 mr-2" />
                  Transfer to Distributor
                </Button>
              )}

            {/* Distributor: Transfer to Wholesaler */}
            {user?.role === "distributor" &&
              product.currentOwnerId === user.id && (
                <Button variant="outline" onClick={openTransferWholDialog}>
                  <Send className="h-4 w-4 mr-2" />
                  Transfer to Wholesaler
                </Button>
              )}

            {/* Wholesaler/Pharmacist: Mark as Sold */}
            {(user?.role === "wholesaler" || user?.role === "pharmacist") &&
              product.currentOwnerId === user.id && (
                <Button
                  variant="outline"
                  onClick={handleMarkAsSold}
                  disabled={soldLoading}
                >
                  {soldLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Marking sold...
                    </>
                  ) : (
                    <>
                      <Store className="h-4 w-4 mr-2" />
                      Mark as Sold
                    </>
                  )}
                </Button>
              )}

            {/* Any participant: Reject Drug */}
            <Button
              variant="destructive"
              onClick={handleRejectDrug}
              disabled={rejectLoading}
            >
              {rejectLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Drug
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Error alerts for actions */}
      {rejectError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{rejectError}</AlertDescription>
        </Alert>
      )}
      {soldError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{soldError}</AlertDescription>
        </Alert>
      )}

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
            {product.onChainDrugId != null && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Blockchain Drug ID
                </label>
                <p className="text-sm mt-1 font-mono font-semibold">#{product.onChainDrugId}</p>
              </div>
            )}
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

      {/* QR Code Card — only shown when on-chain QR hash is available */}
      {onChainQrHash && (
        <Card>
          <CardHeader>
            <CardTitle>Product QR Code</CardTitle>
            <CardDescription>
              On-chain authenticity hash generated during drug registration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-white p-4 rounded-lg border">
                <QRCodeSVG
                  value={onChainQrHash}
                  size={180}
                  level="H"
                  includeMargin
                />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    QR Hash (bytes32)
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs font-mono bg-muted p-2 rounded flex-1 break-all">
                      {onChainQrHash}
                    </p>
                    <CopyButton text={onChainQrHash} id="qrhash" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  This QR code encodes the keccak256 hash stored on-chain. Use it
                  to verify drug authenticity via the &quot;Verify Authenticity&quot;
                  feature on the dashboard.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Transfer to Distributor Dialog */}
      <Dialog open={transferDistDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setTransferDistDialogOpen(false);
          setTransferDistError(null);
          setSelectedDistributor("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer to Distributor</DialogTitle>
            <DialogDescription>
              Transfer &quot;{product.name}&quot; ({product.productCode}) to a registered distributor on-chain.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {transferDistError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{transferDistError}</AlertDescription>
              </Alert>
            )}
            {distributors.length === 0 && !transferDistError ? (
              <p className="text-sm text-muted-foreground">
                No distributors registered under your account. Add distributors from the Users page first.
              </p>
            ) : (
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
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTransferDistDialogOpen(false)} disabled={transferDistLoading}>
                Cancel
              </Button>
              {distributors.length > 0 && (
                <Button onClick={handleTransferToDistributor} disabled={transferDistLoading || !selectedDistributor}>
                  {transferDistLoading ? (
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

      {/* Transfer to Wholesaler Dialog */}
      <Dialog open={transferWholDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setTransferWholDialogOpen(false);
          setTransferWholError(null);
          setSelectedWholesaler("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer to Wholesaler</DialogTitle>
            <DialogDescription>
              Transfer &quot;{product.name}&quot; ({product.productCode}) to a registered wholesaler on-chain.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {transferWholError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{transferWholError}</AlertDescription>
              </Alert>
            )}
            {wholesalers.length === 0 && !transferWholError ? (
              <p className="text-sm text-muted-foreground">
                No active wholesalers found. Ensure wholesalers are registered and approved first.
              </p>
            ) : (
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
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTransferWholDialogOpen(false)} disabled={transferWholLoading}>
                Cancel
              </Button>
              {wholesalers.length > 0 && (
                <Button onClick={handleTransferToWholesaler} disabled={transferWholLoading || !selectedWholesaler}>
                  {transferWholLoading ? (
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
    </div>
  );
}
