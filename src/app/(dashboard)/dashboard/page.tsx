"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckIcon,
  PlusIcon,
  QrCode,
  ShoppingCart,
  Verified,
  WarehouseIcon,
  Loader2,
  AlertCircle,
  Factory,
  Truck,
  Building2,
  Store,
  XCircle,
  CheckCircle,
  ArrowRight,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Calendar27 from "./BarChart";
import { useSupplyChainContract, Stage } from "@/hooks/use-supply-chain-contract";
import type { DrugStruct } from "@/hooks/use-supply-chain-contract";
import { useUser } from "@/contexts/user-context";

interface DashboardStats {
  products: {
    total: number;
    verified: number;
    pending: number;
    expired: number;
    lowStock: number;
  };
  transactions: {
    total: number;
    confirmed: number;
    pending: number;
    failed: number;
  };
  users: {
    total: number;
    manufacturers: number;
    distributors: number;
    pharmacists: number;
    wholesalers: number;
    admins: number;
  };
}

interface JourneyStep {
  address: string;
  name: string;
  role: string;
}

const stageLabels: Record<number, string> = {
  [Stage.Manufactured]: "Manufactured",
  [Stage.Distributed]: "Distributed",
  [Stage.Wholesaled]: "Wholesaled",
  [Stage.Sold]: "Sold",
};

const stageIcons: Record<number, typeof Factory> = {
  [Stage.Manufactured]: Factory,
  [Stage.Distributed]: Truck,
  [Stage.Wholesaled]: Building2,
  [Stage.Sold]: Store,
};

export default function SupplyChainDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  // Track Product state
  const [trackOpen, setTrackOpen] = useState(false);
  const [trackId, setTrackId] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackResult, setTrackResult] = useState<{
    drug: DrugStruct;
    journey: JourneyStep[];
    currentOwnerName: string;
  } | null>(null);

  // Verify Authenticity state
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyDrugId, setVerifyDrugId] = useState("");
  const [verifyQrHash, setVerifyQrHash] = useState("");
  const [verifyFetchingHash, setVerifyFetchingHash] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<{
    isAuthentic: boolean;
    isExpired: boolean;
    isRejected: boolean;
    stage: Stage;
    currentOwner: string;
    ownerName: string;
    qrHash: string;
    drugName: string;
  } | null>(null);

  const { getDrugDetails, getDrugJourney, verifyDrugByQR } =
    useSupplyChainContract();

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  /** Auto-fetch QR hash when drug ID changes in the Verify dialog */
  useEffect(() => {
    const drugId = parseInt(verifyDrugId);
    if (isNaN(drugId) || drugId < 1) {
      setVerifyQrHash("");
      return;
    }

    let cancelled = false;
    const fetchHash = async () => {
      setVerifyFetchingHash(true);
      setVerifyError(null);
      try {
        const drug = await getDrugDetails(drugId);
        if (!cancelled) {
          setVerifyQrHash(drug.qrHash);
        }
      } catch {
        if (!cancelled) {
          setVerifyQrHash("");
        }
      } finally {
        if (!cancelled) {
          setVerifyFetchingHash(false);
        }
      }
    };

    const debounce = setTimeout(fetchHash, 500);
    return () => {
      cancelled = true;
      clearTimeout(debounce);
    };
  }, [verifyDrugId, getDrugDetails]);

  /** Role abbreviation labels for the journey display */
  const rolePrefixes: Record<string, string> = {
    manufacturer: "Manu",
    distributor: "Dist",
    pharmacist: "Pharm",
    wholesaler: "Whol",
    admin: "Admin",
  };

  /** Resolve wallet addresses to user details from the database */
  const resolveAddresses = async (
    addresses: string[]
  ): Promise<Map<string, { name: string; role: string }>> => {
    const map = new Map<string, { name: string; role: string }>();
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const users: {
          fullName: string;
          walletId: string;
          organization: string;
          role: string;
        }[] = await res.json();
        for (const addr of addresses) {
          const matched = users.find(
            (u) => u.walletId.toLowerCase() === addr.toLowerCase()
          );
          if (matched) {
            const prefix = rolePrefixes[matched.role] ?? matched.role;
            map.set(addr.toLowerCase(), {
              name: `${prefix} (${matched.organization})`,
              role: matched.role,
            });
          } else if (addr === "0x0000000000000000000000000000000000000000") {
            map.set(addr.toLowerCase(), {
              name: "Sold to Customer",
              role: "customer",
            });
          } else {
            map.set(addr.toLowerCase(), {
              name: `${addr.slice(0, 6)}...${addr.slice(-4)}`,
              role: "unknown",
            });
          }
        }
      }
    } catch {
      // fallback: just show truncated addresses
      for (const addr of addresses) {
        if (!map.has(addr.toLowerCase())) {
          map.set(addr.toLowerCase(), {
            name: `${addr.slice(0, 6)}...${addr.slice(-4)}`,
            role: "unknown",
          });
        }
      }
    }
    return map;
  };

  /** Handle Track Product form submission */
  const handleTrackProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError(null);
    setTrackResult(null);

    const drugId = parseInt(trackId);
    if (isNaN(drugId) || drugId < 1) {
      setTrackError("Please enter a valid on-chain drug ID (positive number).");
      return;
    }

    setTrackLoading(true);
    try {
      const [drug, journeyAddresses] = await Promise.all([
        getDrugDetails(drugId),
        getDrugJourney(drugId),
      ]);

      // Resolve all addresses (journey + current owner) in one call
      const allAddresses = [...journeyAddresses];
      if (!allAddresses.some((a) => a.toLowerCase() === drug.currentOwner.toLowerCase())) {
        allAddresses.push(drug.currentOwner);
      }
      const nameMap = await resolveAddresses(allAddresses);

      const journey: JourneyStep[] = journeyAddresses.map((addr) => {
        const resolved = nameMap.get(addr.toLowerCase());
        return {
          address: addr,
          name: resolved?.name ?? `${addr.slice(0, 6)}...${addr.slice(-4)}`,
          role: resolved?.role ?? "unknown",
        };
      });

      const currentOwnerResolved = nameMap.get(drug.currentOwner.toLowerCase());
      const currentOwnerName =
        drug.currentOwner === "0x0000000000000000000000000000000000000000"
          ? "Sold (no owner)"
          : currentOwnerResolved?.name ?? `${drug.currentOwner.slice(0, 6)}...${drug.currentOwner.slice(-4)}`;

      setTrackResult({ drug, journey, currentOwnerName });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.includes("user rejected") || message.includes("ACTION_REJECTED")) {
        setTrackError("MetaMask transaction was rejected.");
      } else {
        setTrackError(message);
      }
    } finally {
      setTrackLoading(false);
    }
  };

  /** Handle Verify Authenticity form submission */
  const handleVerifyProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);
    setVerifyResult(null);

    const drugId = parseInt(verifyDrugId);
    if (isNaN(drugId) || drugId < 1) {
      setVerifyError("Please enter a valid on-chain drug ID (positive number).");
      return;
    }

    if (!verifyQrHash.trim()) {
      setVerifyError("Please enter the QR hash to verify.");
      return;
    }

    setVerifyLoading(true);
    try {
      // Fetch drug details for name + qrHash, and verify in parallel
      const [result, drug] = await Promise.all([
        verifyDrugByQR(drugId, verifyQrHash.trim()),
        getDrugDetails(drugId),
      ]);

      // Resolve owner name
      const nameMap = await resolveAddresses([result.currentOwner]);
      const resolved = nameMap.get(result.currentOwner.toLowerCase());
      const ownerName =
        resolved?.name ??
        `${result.currentOwner.slice(0, 6)}...${result.currentOwner.slice(-4)}`;

      setVerifyResult({
        ...result,
        ownerName,
        qrHash: drug.qrHash,
        drugName: drug.name,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.includes("user rejected") || message.includes("ACTION_REJECTED")) {
        setVerifyError("MetaMask transaction was rejected.");
      } else {
        setVerifyError(message);
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  const formatTimestamp = (ts: bigint) => {
    const date = new Date(Number(ts) * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Role-aware stat cards
  const getStatCards = () => {
    const role = user?.role;

    if (role === "distributor") {
      return [
        {
          label: "My Inventory",
          value: stats?.products.total ?? 0,
          icon: Package,
        },
        {
          label: "My Transactions",
          value: stats?.transactions.total ?? 0,
          icon: Truck,
        },
        {
          label: "Forwarded",
          value: stats?.transactions.confirmed ?? 0,
          icon: ArrowUpFromLine,
        },
      ];
    }

    if (role === "pharmacist") {
      return [
        {
          label: "My Inventory",
          value: stats?.products.total ?? 0,
          icon: Package,
        },
        {
          label: "My Transactions",
          value: stats?.transactions.total ?? 0,
          icon: Truck,
        },
        {
          label: "Products Sold",
          value: stats?.transactions.confirmed ?? 0,
          icon: Store,
        },
      ];
    }

    if (role === "wholesaler") {
      return [
        {
          label: "My Inventory",
          value: stats?.products.total ?? 0,
          icon: Package,
        },
        {
          label: "My Transactions",
          value: stats?.transactions.total ?? 0,
          icon: Truck,
        },
        {
          label: "Products Sold",
          value: stats?.transactions.confirmed ?? 0,
          icon: Store,
        },
      ];
    }

    if (role === "manufacturer") {
      return [
        {
          label: "My Products",
          value: stats?.products.total ?? 0,
          icon: Factory,
        },
        {
          label: "My Transactions",
          value: stats?.transactions.total ?? 0,
          icon: Truck,
        },
        {
          label: "Active Users",
          value: stats?.users.total ?? 0,
          icon: CheckCircle,
        },
      ];
    }

    // Admin — global view
    return [
      {
        label: "Total Products",
        value: stats?.products.total ?? 0,
        icon: Package,
      },
      {
        label: "Transactions Processed",
        value: stats?.transactions.total ?? 0,
        icon: Truck,
      },
      {
        label: "Active Users",
        value: stats?.users.total ?? 0,
        icon: CheckCircle,
      },
    ];
  };

  // Role-aware activity items
  const getActivities = () => {
    const role = user?.role;

    if (role === "distributor") {
      return [
        {
          icon: <ArrowDownToLine />,
          title: "Products in Inventory",
          detail: `${stats?.products.total ?? 0} products currently held`,
          color: "bg-primary/20 text-primary",
        },
        {
          icon: <CheckIcon />,
          title: "Verified Products",
          detail: `${stats?.products.verified ?? 0} verified in inventory`,
          color: "bg-primary/20 text-primary",
        },
        {
          icon: <ArrowUpFromLine />,
          title: "Transactions Confirmed",
          detail: `${stats?.transactions.confirmed ?? 0} transfers confirmed`,
          color: "bg-primary/20 text-primary",
        },
        {
          icon: <AlertCircle />,
          title: "Pending Transactions",
          detail: `${stats?.transactions.pending ?? 0} awaiting confirmation`,
          color: "bg-primary/20 text-primary",
        },
        {
          icon: <XCircle />,
          title: "Expired Products",
          detail: `${stats?.products.expired ?? 0} expired / rejected`,
          color: "bg-primary/20 text-primary",
          isLast: true,
        },
      ];
    }

    if (role === "pharmacist") {
      return [
        {
          icon: <Package />,
          title: "Products in Stock",
          detail: `${stats?.products.total ?? 0} products on hand`,
          color: "bg-primary/20 text-primary",
        },
        {
          icon: <ShoppingCart />,
          title: "Products Verified",
          detail: `${stats?.products.verified ?? 0} verified products`,
          color: "bg-primary/20 text-primary",
        },
        {
          icon: <WarehouseIcon />,
          title: "Transactions Confirmed",
          detail: `${stats?.transactions.confirmed ?? 0} confirmed`,
          color: "bg-primary/20 text-primary",
        },
        {
          icon: <CheckIcon />,
          title: "Low Stock Alerts",
          detail: `${stats?.products.lowStock ?? 0} products with low stock`,
          color: "bg-primary/20 text-primary",
          isLast: true,
        },
      ];
    }

    if (role === "wholesaler") {
      return [
        {
          icon: <Package />,
          title: "Products in Stock",
          detail: `${stats?.products.total ?? 0} products on hand`,
          color: "bg-primary/20 text-primary",
        },
        {
          icon: <ShoppingCart />,
          title: "Products Verified",
          detail: `${stats?.products.verified ?? 0} verified products`,
          color: "bg-primary/20 text-primary",
        },
        {
          icon: <WarehouseIcon />,
          title: "Transactions Confirmed",
          detail: `${stats?.transactions.confirmed ?? 0} confirmed`,
          color: "bg-primary/20 text-primary",
        },
        {
          icon: <CheckIcon />,
          title: "Low Stock Alerts",
          detail: `${stats?.products.lowStock ?? 0} products with low stock`,
          color: "bg-primary/20 text-primary",
          isLast: true,
        },
      ];
    }

    // Admin and Manufacturer — original activity set
    return [
      {
        icon: <PlusIcon />,
        title: "Product Added",
        detail: `${stats?.products.pending ?? 0} pending verification`,
        color: "bg-primary/20 text-primary",
      },
      {
        icon: <ShoppingCart />,
        title: "Products Verified",
        detail: `${stats?.products.verified ?? 0} verified products`,
        color: "bg-primary/20 text-primary",
      },
      {
        icon: <WarehouseIcon />,
        title: "Transactions Confirmed",
        detail: `${stats?.transactions.confirmed ?? 0} confirmed`,
        color: "bg-primary/20 text-primary",
      },
      {
        icon: <CheckIcon />,
        title: "Low Stock Alerts",
        detail: `${stats?.products.lowStock ?? 0} products with low stock`,
        color: "bg-primary/20 text-primary",
      },
      {
        icon: <CheckIcon />,
        title: "Expired Products",
        detail: `${stats?.products.expired ?? 0} expired`,
        color: "bg-primary/20 text-primary",
        isLast: true,
      },
    ];
  };

  const statCards = getStatCards();
  const activities = getActivities();

  return (
    <div className="flex-1 bg-background">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Track Product Dialog */}
          <Dialog
            open={trackOpen}
            onOpenChange={(open) => {
              setTrackOpen(open);
              if (!open) {
                setTrackId("");
                setTrackError(null);
                setTrackResult(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                className="flex items-center gap-2 rounded-lg shadow-sm"
              >
                <QrCode />
                Track Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Track Product</DialogTitle>
                <DialogDescription>
                  Enter the on-chain drug ID to view its details and journey
                  through the supply chain.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleTrackProduct} className="space-y-4 mt-4">
                {trackError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{trackError}</AlertDescription>
                  </Alert>
                )}
                <div>
                  <Label className="mb-1 block">On-Chain Drug ID</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 1, 2, 3..."
                    value={trackId}
                    onChange={(e) => setTrackId(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={trackLoading}>
                    {trackLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Tracking...
                      </>
                    ) : (
                      "Track"
                    )}
                  </Button>
                </div>
              </form>

              {/* Track Results */}
              {trackResult && (
                <div className="space-y-4 mt-2 border-t pt-4">
                  {/* Drug Details */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Drug Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span>
                        <p className="font-medium">{trackResult.drug.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Drug ID:</span>
                        <p className="font-mono font-medium">
                          #{Number(trackResult.drug.drugId)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Stage:</span>
                        <div className="mt-1">
                          <Badge
                            variant={
                              trackResult.drug.isRejected
                                ? "destructive"
                                : "default"
                            }
                            className="flex items-center gap-1 w-fit"
                          >
                            {trackResult.drug.isRejected ? (
                              <>
                                <XCircle className="h-3 w-3" /> Rejected
                              </>
                            ) : (
                              <>
                                {(() => {
                                  const Icon =
                                    stageIcons[trackResult.drug.stage] ??
                                    Factory;
                                  return <Icon className="h-3 w-3" />;
                                })()}
                                {stageLabels[trackResult.drug.stage] ??
                                  "Unknown"}
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Current Owner:
                        </span>
                        <p className="text-sm font-medium">
                          {trackResult.currentOwnerName}
                        </p>
                        {trackResult.drug.currentOwner !==
                          "0x0000000000000000000000000000000000000000" && (
                            <p className="text-xs text-muted-foreground font-mono break-all">
                              {trackResult.drug.currentOwner}
                            </p>
                          )}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mfg Date:</span>
                        <p className="font-medium">
                          {formatTimestamp(trackResult.drug.manufacturingDate)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Expiry Date:
                        </span>
                        <p className="font-medium">
                          {formatTimestamp(trackResult.drug.expiryDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  {trackResult.drug.qrHash && (
                    <div className="flex flex-col items-center gap-2 pt-2 border-t">
                      <p className="text-xs text-muted-foreground font-medium">Product QR Code</p>
                      <div className="bg-white p-3 rounded-lg">
                        <QRCodeSVG
                          value={trackResult.drug.qrHash}
                          size={140}
                          level="H"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono break-all text-center max-w-full">
                        {trackResult.drug.qrHash}
                      </p>
                    </div>
                  )}

                  {/* Journey */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">
                      Ownership Journey ({trackResult.journey.length} step
                      {trackResult.journey.length !== 1 ? "s" : ""})
                    </h4>
                    <div className="space-y-3">
                      {trackResult.journey.map((step, index) => {
                        const roleIconMap: Record<string, typeof Factory> = {
                          manufacturer: Factory,
                          distributor: Truck,
                          pharmacist: Store,
                          wholesaler: Building2,
                          admin: Building2,
                        };
                        const StepIcon = roleIconMap[step.role] ?? Building2;
                        return (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <StepIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                <p className="text-sm font-semibold">
                                  {step.name}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {index === 0 ? "Manufacturer" : index === 1 ? "Distributor" : index === 2 ? "Wholesaler" : "Sold"}
                              </p>
                            </div>
                            {index < trackResult.journey.length - 1 && (
                              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Verify Authenticity Dialog */}
          <Dialog
            open={verifyOpen}
            onOpenChange={(open) => {
              setVerifyOpen(open);
              if (!open) {
                setVerifyDrugId("");
                setVerifyQrHash("");
                setVerifyError(null);
                setVerifyResult(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                className="flex items-center gap-2 rounded-lg shadow-sm"
              >
                <Verified />
                Verify Authenticity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Verify Product Authenticity</DialogTitle>
                <DialogDescription>
                  Enter the on-chain drug ID and its QR hash to verify
                  authenticity.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleVerifyProduct} className="space-y-4 mt-4">
                {verifyError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{verifyError}</AlertDescription>
                  </Alert>
                )}
                <div>
                  <Label className="mb-1 block">On-Chain Drug ID</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 1, 2, 3..."
                    value={verifyDrugId}
                    onChange={(e) => setVerifyDrugId(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label className="mb-1 block">QR Hash</Label>
                  <div className="relative">
                    <Input
                      placeholder={verifyFetchingHash ? "Fetching QR hash..." : "Auto-filled from blockchain"}
                      value={verifyQrHash}
                      onChange={(e) => setVerifyQrHash(e.target.value)}
                      readOnly={verifyFetchingHash}
                      required
                      className="font-mono text-xs"
                    />
                    {verifyFetchingHash && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    QR hash is auto-fetched when you enter a valid drug ID.
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={verifyLoading}>
                    {verifyLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
              </form>

              {/* Verify Results */}
              {verifyResult && (
                <div className="space-y-4 mt-2 border-t pt-4">
                  <h4 className="font-semibold text-sm">Verification Result</h4>

                  {/* Drug Name */}
                  <p className="text-sm">
                    <span className="text-muted-foreground">Drug:</span>{" "}
                    <span className="font-medium">{verifyResult.drugName}</span>
                  </p>

                  {/* Authenticity Badge */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {verifyResult.isAuthentic ? (
                      <Badge className="flex items-center gap-1 bg-green-600 text-white">
                        <CheckCircle className="h-3 w-3" />
                        Authentic
                      </Badge>
                    ) : (
                      <Badge
                        variant="destructive"
                        className="flex items-center gap-1"
                      >
                        <XCircle className="h-3 w-3" />
                        Not Authentic
                      </Badge>
                    )}
                    {verifyResult.isExpired && (
                      <Badge
                        variant="destructive"
                        className="flex items-center gap-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        Expired
                      </Badge>
                    )}
                    {verifyResult.isRejected && (
                      <Badge
                        variant="destructive"
                        className="flex items-center gap-1"
                      >
                        <XCircle className="h-3 w-3" />
                        Rejected
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Stage:</span>
                      <p className="font-medium">
                        {stageLabels[verifyResult.stage] ?? "Unknown"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Current Owner:
                      </span>
                      <p className="font-medium text-xs break-all">
                        {verifyResult.ownerName}
                      </p>
                    </div>
                  </div>

                  {/* QR Code */}
                  {verifyResult.qrHash && (
                    <div className="flex flex-col items-center gap-2 pt-2 border-t">
                      <p className="text-xs text-muted-foreground font-medium">Product QR Code</p>
                      <div className="bg-white p-3 rounded-lg">
                        <QRCodeSVG
                          value={verifyResult.qrHash}
                          size={160}
                          level="H"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono break-all text-center max-w-full">
                        {verifyResult.qrHash}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-xl border border-border"
            >
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {loading ? "..." : stat.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Calendar27 />
          </div>

          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Supply Chain Overview
            </h3>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full ${activity.color} flex items-center justify-center`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {activity.icon}
                      </span>
                    </div>
                    {!activity.isLast && (
                      <div className="w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
