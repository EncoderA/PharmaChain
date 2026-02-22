"use client";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useSupplyChainContract } from "@/hooks/use-supply-chain-contract";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BrowserProvider } from "ethers";

type Inputs = {
  fullName: string;
  email: string;
  role: string;
  organization: string;
  phone: string;
  walletId: string;
};

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  const { addAdmin, addManufacturer, addDistributor, addWholesaler, getAdmins } = useSupplyChainContract();

  useEffect(() => {
    const checkAdmin = async () => {
      setIsAdminUser(false);
      if (!open) return;
      try {
        if (!window.ethereum) return;
        const provider = new BrowserProvider(window.ethereum as any);
        const signer = await provider.getSigner();
        const addr = await signer.getAddress();

        const admins = await getAdmins();
        if (admins && Array.isArray(admins)) {
          const normalized = admins.map((a: string) => a.toLowerCase());
          setIsAdminUser(normalized.includes(addr.toLowerCase()));
        }
      } catch (err) {
        // silent
      }
    };
    checkAdmin();
  }, [open, getAdmins]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setMessage(null);
    setMessageType(null);
    try {
      setLoading(true);

      if (!isAdminUser) {
        throw new Error("Only admin users can add new users on-chain/off-chain");
      }

      // call on-chain role function if available
      const role = data.role;
      if (role === "admin") {
        await addAdmin(data.walletId);
      } else if (role === "manufacturer") {
        await addManufacturer(data.walletId);
      } else if (role === "distributor") {
        await addDistributor(data.walletId);
      } else if (role === "wholesaler") {
        await addWholesaler(data.walletId);
      } // other roles: save only off-chain

      // persist off-chain
      await axios.post("/api/user", data);

      setMessage("User added successfully");
      setMessageType("success");
      reset();
      setOpen(false);
    } catch (error: any) {
      const msg = error?.message || "Failed to add user";
      setMessage(msg);
      setMessageType("error");
      console.error("Error adding user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Add a new user to the supply chain network
          </DialogDescription>
        </DialogHeader>

        {message && (
          <div className="mb-4">
            <Alert variant={messageType === "error" ? "destructive" : undefined}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
           {!isAdminUser && (
            <div className="text-sm text-red-600">Only connected admin wallets can add users.</div>
          )}
          {/* Full Name */}
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              placeholder="Enter full name"
              {...register("fullName", { required: "Full name is required" })}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter email"
              {...register("email", { required: "Email is required" })}
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Controller
              name="role"
              control={control}
              rules={{ required: "Role is required" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                    <SelectItem value="distributor">Distributor</SelectItem>
                    <SelectItem value="wholesaler">Wholesaler</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy/Retailer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

         

          <div className="space-y-2">
            <Label>Company/Organization</Label>
            <Input
              placeholder="Enter company name"
              {...register("organization", {
                required: "Organization is required",
              })}
            />
          </div>

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input placeholder="Enter phone number" {...register("phone")} />
          </div>
          <div className="space-y-2">
            <Label>Wallet Id</Label>
            <Input
              placeholder="Enter wallet id"
              {...register("walletId", { required: "Wallet Id is required" })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
