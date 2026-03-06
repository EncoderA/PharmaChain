"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, Plus } from "lucide-react";
import { useSupplyChainContract } from "@/hooks/use-supply-chain-contract";

type UserRole = "admin" | "manufacturer" | "distributor" | "pharmacist" | "wholesaler";

interface AddUserDialogProps {
  onUserAdded: () => void;
}

export function AddUserDialog({ onUserAdded }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | "">("");

  const {
    addAdmin,
    addManufacturer,
    addDistributor,
    addWholesaler,
  } = useSupplyChainContract();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      organization: formData.get("organization") as string,
      walletId: formData.get("walletId") as string,
      password: formData.get("password") as string,
      role,
    };

    if (!data.fullName || !data.email || !data.phone || !data.organization || !data.walletId || !data.role) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Register user on-chain via MetaMask
      switch (data.role) {
        case "admin":
          await addAdmin(data.walletId);
          break;
        case "manufacturer":
          await addManufacturer(data.walletId);
          break;
        case "distributor":
          await addDistributor(data.walletId);
          break;
        case "pharmacist":
          // pharmacist = wholesaler on-chain
          await addWholesaler(data.walletId);
          break;
        case "wholesaler":
          await addWholesaler(data.walletId);
          break;
        default:
          throw new Error("Invalid role");
      }

      // Step 2: Save to database
      const res = await fetch("/api/admin/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to save user to database");
      }

      setOpen(false);
      setRole("");
      onUserAdded();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.includes("user rejected") || message.includes("ACTION_REJECTED")) {
        setError("MetaMask transaction was rejected. The user was not added.");
      } else if (message.includes("AlreadyRegistered")) {
        setError("This wallet address is already registered on-chain.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setError(null); setRole(""); } }}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Add a user on-chain (via MetaMask) and save their profile to the database.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="add-role">Role</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as UserRole)}
              required
            >
              <SelectTrigger id="add-role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manufacturer">Manufacturer</SelectItem>
                <SelectItem value="distributor">Distributor</SelectItem>
                <SelectItem value="wholesaler">Wholesaler</SelectItem>
                <SelectItem value="pharmacist">Pharmacist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="add-fullName">Full Name</Label>
            <Input id="add-fullName" name="fullName" placeholder="John Doe" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="add-email">Email</Label>
            <Input id="add-email" name="email" type="email" placeholder="john@example.com" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="add-password">Password (optional)</Label>
            <Input id="add-password" name="password" type="password" placeholder="Leave blank for no password" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="add-phone">Phone</Label>
            <Input id="add-phone" name="phone" placeholder="+91 9876543210" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="add-organization">Organization</Label>
            <Input id="add-organization" name="organization" placeholder="Company Name" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="add-walletId">Wallet Address</Label>
            <Input id="add-walletId" name="walletId" placeholder="0x..." required />
            <p className="text-xs text-muted-foreground">
              This address will be registered on-chain with the selected role via MetaMask.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !role} className="cursor-pointer">
              {loading ? <Spinner className="h-4 w-4" /> : "Add User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
