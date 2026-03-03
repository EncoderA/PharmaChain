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
import { Users as UsersIcon, UserCheck, UserX, Clock, Truck, Building2 } from "lucide-react";
import { UserFiltersClient } from "@/components/users/user-filters-client";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/user-context";
<<<<<<< HEAD
import axios from "axios";
=======
import { AddUserDialog } from "@/components/admin/add-user-dialog";
import { useSupplyChainContract } from "@/hooks/use-supply-chain-contract";
>>>>>>> 196c0ac (on-chain off-chain connection)

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: "manufacturer" | "distributor" | "pharmacist" | "admin";
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
  const { getMyDistributors, getMyWholesalers } = useSupplyChainContract();

  // My on-chain participants (manufacturer only)
  const [myDistributors, setMyDistributors] = useState<{ address: string; name: string; organization: string }[]>([]);
  const [myWholesalers, setMyWholesalers] = useState<{ address: string; name: string; organization: string }[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

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

  const fetchUsers = async () => {
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
  };

  // Fetch users only when authorized
  useEffect(() => {
    if (isAuthorized) {
      fetchUsers();
    }
  }, [isAuthorized, fetchUsers]);

  // Fetch on-chain participants for manufacturers
  useEffect(() => {
    if (!isAuthorized || currentUser?.role !== "manufacturer") return;

    const fetchMyParticipants = async () => {
      setParticipantsLoading(true);
      try {
        const [distAddresses, wholAddresses] = await Promise.all([
          getMyDistributors(),
          getMyWholesalers(),
        ]);

        // Match addresses with DB users for display names
        const res = await fetch("/api/user");
        const dbUsers: { fullName: string; walletId: string; organization: string; status: string }[] =
          res.ok ? await res.json() : [];

        const matchAddr = (addr: string) => {
          const u = dbUsers.find(
            (u) => u.walletId.toLowerCase() === addr.toLowerCase() && u.status === "active"
          );
          return {
            address: addr,
            name: u?.fullName ?? `${addr.slice(0, 6)}...${addr.slice(-4)}`,
            organization: u?.organization ?? "Unknown",
          };
        };

        setMyDistributors(distAddresses.map(matchAddr));
        setMyWholesalers(wholAddresses.map(matchAddr));
      } catch (err) {
        console.error("Failed to fetch on-chain participants:", err);
      } finally {
        setParticipantsLoading(false);
      }
    };

    fetchMyParticipants();
  }, [isAuthorized, currentUser?.role, getMyDistributors, getMyWholesalers]);

  const handleRetry = () => {
    fetchUsers();
  };

  const handleUserDeleted = () => {
    fetchUsers();
  };

  const handleStatusChanged = () => {
    fetchUsers();
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
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* My Wholesalers / Pharmacists */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-purple-500" />
                    My Pharmacists
                  </CardTitle>
                  <CardDescription>
                    Pharmacists (wholesalers) registered under your account on-chain
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
                      No pharmacists registered yet. Approve pending pharmacist requests to add them.
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
                onDelete={handleUserDeleted}
              />
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
    </div>
  );
};

export default UsersPage;
