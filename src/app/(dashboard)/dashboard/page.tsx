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
  QrCode,
  Verified,
  Loader2,
  AlertCircle,
  Factory,
  Truck,
  Building2,
  Store,
  XCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useSupplyChainContract, Stage } from "@/hooks/use-supply-chain-contract";
import type { DrugStruct } from "@/hooks/use-supply-chain-contract";
import { useUser } from "@/contexts/user-context";

import AdminDashboard from "@/components/dashboard/admin-dashboard";
import ManufacturerDashboard from "@/components/dashboard/manufacturer-dashboard";
import DistributorDashboard from "@/components/dashboard/distributor-dashboard";
import WholesalerDashboard from "@/components/dashboard/wholesaler-dashboard";

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

      // Fetch off-chain transactions from database using the API
      // First, get the product ID corresponding to this on-chain drug ID
      const productRes = await fetch(`/api/products?onChainDrugId=${drugId}`);
      let dbTransactions: any[] = [];
      if (productRes.ok) {
        const products = await productRes.json();
        if (products && products.length > 0) {
          const productId = products[0].id;
          const txRes = await fetch(`/api/transactions?productId=${productId}`);
          if (txRes.ok) {
            dbTransactions = await txRes.json();
          }
        }
      }

      // Collect addresses from on-chain journey
      const allAddresses = [...journeyAddresses];
      if (!allAddresses.some((a) => a.toLowerCase() === drug.currentOwner.toLowerCase())) {
        allAddresses.push(drug.currentOwner);
      }
      const nameMap = await resolveAddresses(allAddresses);

      // Build the base on-chain journey
      const onChainJourney: JourneyStep[] = journeyAddresses
        .filter((addr) => addr !== "0x0000000000000000000000000000000000000000")
        .map((addr) => {
        const resolved = nameMap.get(addr.toLowerCase());
        return {
          address: addr,
          name: resolved?.name ?? `${addr.slice(0, 6)}...${addr.slice(-4)}`,
          role: resolved?.role ?? "unknown",
        };
      });

      // Append off-chain transactions (Pharmacist / Sold) from DB
      const offChainSteps: JourneyStep[] = dbTransactions
        .filter((tx) => !tx.txHash && tx.action !== "Sold") // purely off-chain and not Sold
        .map((tx) => {
          let role = "unknown";
          let address = "Off-chain";
          if (tx.action === "Transferred to Pharmacist") {
            role = "pharmacist";
          }
          return {
            name: tx.toUserName || tx.action,
            role: role,
            address: address,
          };
        });

      const journey = [...onChainJourney, ...offChainSteps];

      // Resolve current owner (handles case where final owner is off-chain)
      let currentOwnerName = "";
      const isSoldOffChain = dbTransactions.some((tx) => tx.action === "Sold");

      if (isSoldOffChain) {
        currentOwnerName = "Sold to Customer";
      } else if (offChainSteps.length > 0) {
        currentOwnerName = offChainSteps[offChainSteps.length - 1].name;
      } else {
        const currentOwnerResolved = nameMap.get(drug.currentOwner.toLowerCase());
        currentOwnerName =
          drug.currentOwner === "0x0000000000000000000000000000000000000000"
            ? "Sold (no owner)"
            : currentOwnerResolved?.name ?? `${drug.currentOwner.slice(0, 6)}...${drug.currentOwner.slice(-4)}`;
      }

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

  // Render the role-specific dashboard
  const renderDashboard = () => {
    switch (user?.role) {
      case "admin":
        return <AdminDashboard />;
      case "manufacturer":
        return <ManufacturerDashboard />;
      case "distributor":
        return <DistributorDashboard />;
      case "wholesaler":
      case "pharmacist":
        return <WholesalerDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex-1 bg-background">
      <div className="p-6 space-y-6">
        {/* Shared Actions: Track Product + Verify Authenticity */}
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
                                {index === 0 ? "Manufacturer" :
                                  index === 1 ? "Distributor" :
                                    index === 2 ? "Wholesaler" :
                                      index === 3 || step.role === "pharmacist" ? "Pharmacist" :
                                        index === 4 || step.role === "customer" ? "Sold to Consumer" :
                                          step.role}
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

        {/* Role-Specific Dashboard */}
        {renderDashboard()}
      </div>
    </div>
  );
}
