"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Trash2, Loader2 } from "lucide-react";
import { useSupplyChainContract } from "@/hooks/use-supply-chain-contract";

interface UserActionsProps {
  userId: number | string;
  userName?: string;
  userRole?: string;
  walletId?: string;
  onDelete?: () => void;
}

export function UserActions({ userId, userName, userRole, walletId, onDelete }: UserActionsProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    removeAdmin,
    removeManufacturer,
    removeDistributor,
    removeWholesaler,
  } = useSupplyChainContract();

  /**
   * Call the role-specific on-chain removal function.
   * - admin       → removeAdmin(address)
   * - manufacturer → removeManufacturer(address)
   * - distributor  → removeDistributor(address)
   * - pharmacist   → removeWholesaler(address)  (pharmacist = wholesaler on-chain)
   * - wholesaler   → removeWholesaler(address)
   */
  const removeOnChain = async (address: string, role: string) => {
    switch (role) {
      case "admin":
        return removeAdmin(address);
      case "manufacturer":
        return removeManufacturer(address);
      case "distributor":
        return removeDistributor(address);
      case "pharmacist":
      case "wholesaler":
        return removeWholesaler(address);
      default:
        throw new Error(`Unknown role: ${role}`);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError(null);

      // Step 1: Remove participant on-chain if they have a wallet
      if (walletId && userRole) {
        try {
          await removeOnChain(walletId, userRole);
        } catch (chainErr) {
          const msg = chainErr instanceof Error ? chainErr.message : "";
          // If MetaMask rejected, stop here
          if (msg.includes("user rejected") || msg.includes("ACTION_REJECTED")) {
            setError("MetaMask transaction was rejected. The user was not removed.");
            return;
          }
          // If "NotRegistered" error, the participant may not be on-chain — continue with DB deletion
          if (!msg.includes("NotRegistered") && !msg.includes("NR")) {
            console.warn("On-chain removal failed (continuing with DB deletion):", msg);
          }
        }
      }

      // Step 2: Delete from database
      const response = await fetch(`/api/user/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete user");
      }

      setShowConfirm(false);
      onDelete?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete user";
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              setError(null);
              setShowConfirm(true);
            }}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              {userName ? (
                <span className="font-semibold text-foreground">{userName}</span>
              ) : (
                "this user"
              )}
              ? This will remove them from the blockchain and database. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error && (
            <p className="text-sm text-red-500 px-1">{error}</p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
