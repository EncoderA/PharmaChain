"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
} from "lucide-react";
import { useSupplyChainContract } from "@/hooks/use-supply-chain-contract";

interface PendingUser {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: "distributor" | "pharmacist";
  organization: string;
  walletId: string;
  status: "active" | "pending" | "rejected";
}

interface PendingRequestsProps {
  pendingUsers: PendingUser[];
  onStatusChanged: () => void;
}

export function PendingRequests({
  pendingUsers,
  onStatusChanged,
}: PendingRequestsProps) {
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const { addDistributor, addWholesaler } = useSupplyChainContract();

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      distributor: "bg-blue-500/10 text-blue-500",
      pharmacist: "bg-green-500/10 text-green-500",
    };
    return colors[role] || "bg-gray-500/10 text-gray-500";
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleApprove = async (user: PendingUser) => {
    setProcessingId(user.id);
    setActionError(null);
    setActionSuccess(null);

    try {
      // Step 1: Register the user on-chain via MetaMask
      if (!user.walletId) {
        throw new Error("User has no wallet address. Cannot register on-chain.");
      }

      if (user.role === "distributor") {
        await addDistributor(user.walletId);
      } else if (user.role === "pharmacist") {
        // Pharmacist maps to wholesaler on-chain
        await addWholesaler(user.walletId);
      }

      // Step 2: Update DB status to active
      const res = await fetch(`/api/user/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          data.error || "Failed to update user status in database",
        );
      }

      setActionSuccess(`${user.fullName} has been approved and registered on-chain.`);
      onStatusChanged();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to approve user";
      // Provide a clearer message for common MetaMask errors
      if (message.includes("user rejected") || message.includes("ACTION_REJECTED")) {
        setActionError("MetaMask transaction was rejected. The user was not approved.");
      } else {
        setActionError(message);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (user: PendingUser) => {
    setProcessingId(user.id);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/user/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reject user");
      }

      setActionSuccess(`${user.fullName}'s registration has been rejected.`);
      onStatusChanged();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to reject user";
      setActionError(message);
    } finally {
      setProcessingId(null);
    }
  };

  if (pendingUsers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Requests
          </CardTitle>
          <CardDescription>
            No pending registration requests
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Requests
          <Badge variant="secondary" className="ml-2">
            {pendingUsers.length}
          </Badge>
        </CardTitle>
        <CardDescription>
          Approve or reject users who registered under you. Approving will
          register their wallet on the blockchain via MetaMask.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status messages */}
        {actionError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}
        {actionSuccess && (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              {actionSuccess}
            </AlertDescription>
          </Alert>
        )}

        {/* Pending user list */}
        <div className="divide-y">
          {pendingUsers.map((user) => {
            const isProcessing = processingId === user.id;
            return (
              <div
                key={user.id}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-xs">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {user.fullName}
                      </span>
                      <Badge
                        variant="secondary"
                        className={getRoleBadgeColor(user.role)}
                      >
                        {user.role === "pharmacist"
                          ? "Pharmacist / Wholesaler"
                          : "Distributor"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.organization} &middot; {user.email}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Wallet className="h-3 w-3" />
                      <span className="font-mono">
                        {user.walletId
                          ? `${user.walletId.slice(0, 6)}...${user.walletId.slice(-4)}`
                          : "No wallet"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleReject(user)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    {isProcessing ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    disabled={isProcessing || !user.walletId}
                    onClick={() => handleApprove(user)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isProcessing ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
