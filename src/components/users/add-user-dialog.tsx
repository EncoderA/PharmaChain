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
import { Plus } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useForm, SubmitHandler, Controller } from "react-hook-form";

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

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      setLoading(true);

      await axios.post("/api/user", data);

      reset();
      setOpen(false);
    } catch (error) {
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
