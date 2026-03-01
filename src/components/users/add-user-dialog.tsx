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
import { useState } from "react";
import axios from "axios";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUser } from "@/contexts/user-context";

type Inputs = {
  fullName: string;
  email: string;
  password: string;
  role: string;
  organization: string;
  phone: string;
  walletId: string;
};

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null
  );

  const { user } = useUser();
  const isAdmin = user?.role === "admin";

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setMessage(null);
    setMessageType(null);
    try {
      setLoading(true);

      if (!isAdmin) {
        throw new Error("Only admin users can add new users");
      }

      // Check for duplicate email/wallet
      const checkRes = await axios.get(
        `/api/user?email=${encodeURIComponent(data.email)}&walletId=${encodeURIComponent(data.walletId)}`
      );
      if (checkRes.data.exists) {
        if (checkRes.data.reason === "email") {
          throw new Error("A user with this email address already exists");
        } else {
          throw new Error("A user with this wallet address already exists");
        }
      }

      // Create user in DB
      await axios.post("/api/user", data);

      setMessage("User added successfully");
      setMessageType("success");
      reset();
      setTimeout(() => setOpen(false), 1000);
    } catch (error: any) {
      const msg =
        error?.response?.data?.error || error?.message || "Failed to add user";
      setMessage(msg);
      setMessageType("error");
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
            <Alert
              variant={messageType === "error" ? "destructive" : undefined}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isAdmin && (
            <div className="text-sm text-red-600">
              Only admin users can add new users.
            </div>
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

          {/* Password */}
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Enter password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Role */}
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
                    <SelectItem value="pharmacist">
                      Pharmacist / Wholesaler
                    </SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>

          {/* Organization */}
          <div className="space-y-2">
            <Label>Company/Organization</Label>
            <Input
              placeholder="Enter company name"
              {...register("organization", {
                required: "Organization is required",
              })}
            />
            {errors.organization && (
              <p className="text-sm text-red-500">
                {errors.organization.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input placeholder="Enter phone number" {...register("phone")} />
          </div>

          {/* Wallet ID */}
          <div className="space-y-2">
            <Label>Wallet ID</Label>
            <Input
              placeholder="Enter wallet address"
              {...register("walletId", {
                required: "Wallet ID is required",
              })}
            />
            {errors.walletId && (
              <p className="text-sm text-red-500">
                {errors.walletId.message}
              </p>
            )}
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
            <Button type="submit" disabled={loading || !isAdmin}>
              {loading ? "Adding..." : "Add User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
