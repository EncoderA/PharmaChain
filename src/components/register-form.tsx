"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/contexts/user-context";
import { CheckCircle2 } from "lucide-react";
import axios from "axios";
import { useSupplyChainContract } from "@/hooks/use-supply-chain-contract";

interface Manufacturer {
  id: number;
  fullName: string;
  organization: string;
  walletId: string;
}

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [manufacturerId, setManufacturerId] = useState("");
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loadingManufacturers, setLoadingManufacturers] = useState(false);
  const [pendingSuccess, setPendingSuccess] = useState(false);
  const router = useRouter();
  const { refreshUser } = useUser();
  const { registerAsManufacturer } = useSupplyChainContract();

  const needsManufacturer = role === "distributor" || role === "pharmacist" || role === "wholesaler";

  // Fetch manufacturers when a role that needs approval is selected
  useEffect(() => {
    if (needsManufacturer && manufacturers.length === 0) {
      setLoadingManufacturers(true);
      axios
        .get("/api/manufacturers")
        .then((res) => setManufacturers(res.data))
        .catch(() => setManufacturers([]))
        .finally(() => setLoadingManufacturers(false));
    }
  }, [needsManufacturer, manufacturers.length]);

  // Reset manufacturer selection when role changes
  useEffect(() => {
    if (!needsManufacturer) {
      setManufacturerId("");
    }
  }, [needsManufacturer]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role,
      organization: formData.get("organization") as string,
      phone: formData.get("phone") as string,
      walletId: formData.get("walletId") as string,
    };

    if (needsManufacturer) {
      data.manufacturerId = manufacturerId;
    }

    // Client-side validation
    if (!data.fullName || !data.email || !data.password || !data.role || !data.organization || !data.phone) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (!data.walletId) {
      setError("Wallet address is required");
      setLoading(false);
      return;
    }

    if (needsManufacturer && !data.manufacturerId) {
      setError("Please select a manufacturer");
      setLoading(false);
      return;
    }

    if (data.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const confirmPassword = formData.get("confirmPassword") as string;
    if (data.password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Step 1: On-chain registration via MetaMask (manufacturers only)
      if (role === "manufacturer") {
        await registerAsManufacturer();
      }
      // Distributors/Pharmacists are registered on-chain later when the manufacturer approves them.
      // At this point they only create an off-chain pending record.

      // Step 2: Save off-chain details to database
      const res = await axios.post("/api/auth/register", data);

      // If user is pending approval, show success message instead of redirecting
      if (res.data.pending) {
        setPendingSuccess(true);
        return;
      }

      // Active users (manufacturers) are auto-logged in
      await refreshUser();
      router.push("/dashboard");
    } catch (err: any) {
      // Handle MetaMask rejection clearly
      const message = err?.message || "";
      if (message.includes("user rejected") || message.includes("ACTION_REJECTED")) {
        setError("MetaMask transaction was rejected. Registration was not completed.");
      } else {
        setError(
          err?.response?.data?.error || message || "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Show pending approval success screen
  if (pendingSuccess) {
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-xl">Registration Submitted</CardTitle>
            <CardDescription className="text-base mt-2">
              Your registration request has been submitted on-chain and is
              pending approval from the manufacturer. You will be able to log in
              once your account is approved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() => router.push("/login")}
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>
            Register to join the PharmaChain supply chain network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min 6 characters"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  required
                />
              </div>

              {/* Role */}
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select onValueChange={setRole} value={role} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                    <SelectItem value="distributor">Distributor</SelectItem>
                    <SelectItem value="wholesaler">Wholesaler</SelectItem>
                    <SelectItem value="pharmacist">Pharmacist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Manufacturer Selection — shown only for distributor/pharmacist */}
              {needsManufacturer && (
                <div className="grid gap-2">
                  <Label>Select Manufacturer</Label>
                  {loadingManufacturers ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                      <Spinner className="h-4 w-4" />
                      Loading manufacturers...
                    </div>
                  ) : manufacturers.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      No manufacturers available. Please try again later.
                    </p>
                  ) : (
                    <Select
                      onValueChange={setManufacturerId}
                      value={manufacturerId}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a manufacturer" />
                      </SelectTrigger>
                      <SelectContent>
                        {manufacturers.map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            {m.organization} ({m.fullName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Organization */}
              <div className="grid gap-2">
                <Label htmlFor="organization">Company / Organization</Label>
                <Input
                  id="organization"
                  name="organization"
                  placeholder="Your company name"
                  required
                />
              </div>

              {/* Phone */}
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Enter phone number"
                  required
                />
              </div>

              {/* Wallet Address — required for all roles */}
              <div className="grid gap-2">
                <Label htmlFor="walletId">
                  Wallet Address
                  <span className="text-destructive text-xs ml-1">*</span>
                </Label>
                <Input
                  id="walletId"
                  name="walletId"
                  placeholder="0x..."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {role === "manufacturer"
                    ? "Your wallet will be registered on-chain via MetaMask."
                    : needsManufacturer
                    ? "Your wallet will be registered on-chain when the manufacturer approves your request."
                    : "Connect your MetaMask wallet to get your address."}
                </p>
              </div>

              <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                {loading ? <Spinner /> : "Create Account"}
              </Button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="underline underline-offset-4 hover:text-primary">
                  Login
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
