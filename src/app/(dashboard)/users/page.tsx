"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PendingRequests } from "@/components/users/pending-requests";
import { Users as UsersIcon, UserCheck, UserX, Clock, Truck, Building2, Store, Trash2, Loader2 } from "lucide-react";
import { UserFiltersClient } from "@/components/users/user-filters-client";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/contexts/user-context";
import axios from "axios";
import { AddUserDialog } from "@/components/admin/add-user-dialog";
import { useSupplyChainContract } from "@/hooks/use-supply-chain-contract";

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: "manufacturer" | "distributor" | "pharmacist" | "wholesaler" | "admin";
  organization: string;
  walletId: string;
  status: "active" | "pending" | "rejected";
  manufacturerId: number | null;
}

const ALLOWED_ROLES: User["role"][] = ["admin", "manufacturer"];

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser, isLoading: userLoading } = useUser();
  const router = useRouter();
  const { getMyDistributors, getMyWholesalers, removeDistributor, removeWholesaler } = useSupplyChainContract();

  // My on-chain participants (manufacturer only)
  const [myDistributors, setMyDistributors] = useState<{ address: string; name: string; organization: string; dbId: number | null }[]>([]);
  const [myWholesalers, setMyWholesalers] = useState<{ address: string; name: string; organization: string; dbId: number | null }[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  // Removal state
  const [removeTarget, setRemoveTarget] = useState<{ address: string; name: string; role: "distributor" | "wholesaler"; dbId: number | null } | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const isAuthorized =
    !userLoading &&
    currentUser != null &&
    ALLOWED_ROLES.includes(currentUser.role);

  // Client-side role guard — redirect unauthorized users
  useEffect(() => {
    if (
      !userLoading &&
      currentUser &&
      !ALLOWED_ROLES.includes(currentUser.role)
    ) {
      router.replace("/dashboard");
    }
  }, [currentUser, userLoading, router]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.get<User[]>("/api/user");
      setUsers(data);
    } catch (err) {
      // Axios errors include message and response info
      let errorMessage = "Failed to fetch users";
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch users only when authorized
  useEffect(() => {
    if (isAuthorized) {
      fetchUsers();
    }
  }, [isAuthorized, fetchUsers]);

  // Fetch on-chain participants for manufacturers
  const fetchMyParticipants = useCallback(async () => {
    if (currentUser?.role !== "manufacturer") return;
    setParticipantsLoading(true);
    try {
      const [distAddresses, wholAddresses] = await Promise.all([
        getMyDistributors(),
        getMyWholesalers(),
      ]);

      // Match addresses with DB users for display names
      const res = await fetch("/api/user");
      const dbUsers: { id: number; fullName: string; walletId: string; organization: string; status: string }[] =
        res.ok ? await res.json() : [];

      const matchAddr = (addr: string) => {
        const u = dbUsers.find(
          (u) => u.walletId.toLowerCase() === addr.toLowerCase() && u.status === "active"
        );
        return {
          address: addr,
          name: u?.fullName ?? `${addr.slice(0, 6)}...${addr.slice(-4)}`,
          organization: u?.organization ?? "Unknown",
          dbId: u?.id ?? null,
        };
      };

      setMyDistributors(distAddresses.map(matchAddr));
      setMyWholesalers(wholAddresses.map(matchAddr));
    } catch (err) {
      console.error("Failed to fetch on-chain participants:", err);
    } finally {
      setParticipantsLoading(false);
    }
  }, [currentUser?.role, getMyDistributors, getMyWholesalers]);

  useEffect(() => {
    if (!isAuthorized || currentUser?.role !== "manufacturer") return;
    fetchMyParticipants();
  }, [isAuthorized, currentUser?.role, fetchMyParticipants]);

  const handleRetry = () => {
    fetchUsers();
  };

  const handleUserDeleted = () => {
    fetchUsers();
    if (currentUser?.role === "manufacturer") {
      fetchMyParticipants();
    }
  };

  const handleStatusChanged = () => {
    fetchUsers();
  };

  /**
   * Remove a distributor or wholesaler from both on-chain and off-chain.
   * 1. Remove from blockchain via removeDistributor/removeWholesaler
   * 2. Delete from database via DELETE /api/user/:id
   * 3. Refresh both lists
   */
  const handleRemoveParticipant = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    setRemoveError(null);
    try {
      // Step 1: Remove from blockchain
      if (removeTarget.role === "distributor") {
        await removeDistributor(removeTarget.address);
      } else {
        await removeWholesaler(removeTarget.address);
      }

      // Step 2: Delete from database (if user exists in DB)
      if (removeTarget.dbId) {
        const response = await fetch(`/api/user/${removeTarget.dbId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const data = await response.json();
          // Log but don't block — on-chain removal already succeeded
          console.warn("DB deletion warning:", data.error);
        }
      }

      // Step 3: Refresh both lists
      setRemoveTarget(null);
      fetchMyParticipants();
      fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to remove participant";
      if (message.includes("user rejected") || message.includes("ACTION_REJECTED")) {
        setRemoveError("MetaMask transaction was rejected. The user was not removed.");
      } else {
        setRemoveError(message);
      }
    } finally {
      setRemoving(false);
    }
  };

  // --- Early returns (all hooks are above this point) ---

  if (userLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner className="h-8 w-8 mb-3" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!currentUser || !ALLOWED_ROLES.includes(currentUser.role)) {
    return null;
  }

  // Split users into active and pending
  const activeUsers = users.filter((u) => u.status === "active");
  const pendingUsers = users.filter((u) => u.status === "pending");

  // Stats based on active users only
  const stats = [
    {
      title: "Total Active",
      value: activeUsers.length.toString(),
      icon: UsersIcon,
      color: "text-blue-500",
    },
    {
      title: "Manufacturers",
      value: activeUsers
        .filter((u) => u.role === "manufacturer")
        .length.toString(),
      icon: UserCheck,
      color: "text-green-500",
    },
    {
      title: "Distributors",
      value: activeUsers
        .filter((u) => u.role === "distributor")
        .length.toString(),
      icon: Clock,
      color: "text-orange-500",
    },
    {
      title: "Wholesalers",
      value: activeUsers
        .filter((u) => u.role === "wholesaler")
        .length.toString(),
      icon: Store,
      color: "text-purple-500",
    },
    {
      title: "Pharmacists",
      value: activeUsers
        .filter((u) => u.role === "pharmacist")
        .length.toString(),
      icon: UserX,
      color: "text-red-500",
    },
  ];

  return (
    <div className="p-6 bg-background space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage supply chain network users and approvals
          </p>
        </div>
        {currentUser.role === "admin" && (
          <AddUserDialog onUserAdded={fetchUsers} />
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="border-red-500/50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Users</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-2 hover:bg-red-500/10"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner className="h-8 w-8 mb-3" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <>
          {/* Pending Requests — shown to manufacturers (for their registrants) and admins */}
          {(currentUser.role === "manufacturer" ||
            currentUser.role === "admin") &&
            pendingUsers.length > 0 && (
              <PendingRequests
                pendingUsers={pendingUsers as any}
                onStatusChanged={handleStatusChanged}
              />
            )}

          {/* My On-Chain Participants — manufacturer only */}
          {currentUser.role === "manufacturer" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* My Distributors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-500" />
                    My Distributors
                  </CardTitle>
                  <CardDescription>
                    Distributors registered under your account on-chain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {participantsLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground py-4">
                      <Spinner className="h-4 w-4" />
                      Loading...
                    </div>
                  ) : myDistributors.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">
                      No distributors registered yet. Approve pending distributor requests to add them.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {myDistributors.map((d) => (
                        <div
                          key={d.address}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card"
                        >
                          <div>
                            <p className="font-medium text-sm">{d.name}</p>
                            <p className="text-xs text-muted-foreground">{d.organization}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="font-mono text-xs">
                              {d.address.slice(0, 6)}...{d.address.slice(-4)}
                            </Badge>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                    onClick={() => {
                                      setRemoveError(null);
                                      setRemoveTarget({ address: d.address, name: d.name, role: "distributor", dbId: d.dbId });
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Remove distributor</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* My Wholesalers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-purple-500" />
                    My Wholesalers
                  </CardTitle>
                  <CardDescription>
                    Wholesalers registered under your account on-chain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {participantsLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground py-4">
                      <Spinner className="h-4 w-4" />
                      Loading...
                    </div>
                  ) : myWholesalers.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">
                      No wholesalers registered yet. Approve pending wholesaler requests to add them.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {myWholesalers.map((w) => (
                        <div
                          key={w.address}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card"
                        >
                          <div>
                            <p className="font-medium text-sm">{w.name}</p>
                            <p className="text-xs text-muted-foreground">{w.organization}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="font-mono text-xs">
                              {w.address.slice(0, 6)}...{w.address.slice(-4)}
                            </Badge>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                    onClick={() => {
                                      setRemoveError(null);
                                      setRemoveTarget({ address: w.address, name: w.name, role: "wholesaler", dbId: w.dbId });
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Remove wholesaler</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Active Users List */}
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Active network users</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <UserFiltersClient
                users={activeUsers}
                callerRole={currentUser.role}
                onDelete={handleUserDeleted}
              />
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="h-18">
                  <CardContent>
                    <div className="text-sm font-medium flex items-center justify-between">
                      <div className="text-foreground font-semibold text-lg flex items-center gap-2">
                        {stat.title}
                        {":"}
                        <span className="text-base font-bold">
                          {stat.value}
                        </span>
                      </div>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Remove Participant Confirmation Dialog */}
      <AlertDialog open={!!removeTarget} onOpenChange={(open) => { if (!open) setRemoveTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removeTarget?.role === "distributor" ? "Distributor" : "Wholesaler"}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-foreground">{removeTarget?.name}</span>
              ? This will remove them from both the blockchain and the database. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {removeError && (
            <p className="text-sm text-red-500 px-1">{removeError}</p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing} onClick={() => setRemoveTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRemoveParticipant();
              }}
              disabled={removing}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {removing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersPage;
