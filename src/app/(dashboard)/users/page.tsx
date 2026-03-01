"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AddUserDialog } from "@/components/users/add-user-dialog";
import { ReferralCard } from "@/components/users/referral-card";
import { UserActions } from "@/components/users/user-actions";
import { Users as UsersIcon, UserCheck, UserX, Clock } from "lucide-react";
import { UserFiltersClient } from "@/components/users/user-filters-client";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: "manufacturer" | "distributor" | "pharmacist" | "admin";
  organization: string;
  walletId: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Failed to fetch users (${response.status})`,
          );
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch users";
        setError(errorMessage);
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  // Use fetched users, or empty array if none available
  const displayUsers = users;

  const stats = [
    {
      title: "Total Users",
      value: displayUsers.length.toString(),
      icon: UsersIcon,
      color: "text-blue-500",
    },
    {
      title: "Manufacturers",
      value: displayUsers
        .filter((u) => u.role === "manufacturer")
        .length.toString(),
      icon: UserCheck,
      color: "text-green-500",
    },
    {
      title: "Distributors",
      value: displayUsers
        .filter((u) => u.role === "distributor")
        .length.toString(),
      icon: Clock,
      color: "text-orange-500",
    },
    {
      title: "Pharmacists",
      value: displayUsers
        .filter((u) => u.role === "pharmacist")
        .length.toString(),
      icon: UserX,
      color: "text-red-500",
    },
  ];

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      manufacturer: "bg-purple-500/10 text-purple-500",
      distributor: "bg-blue-500/10 text-blue-500",
      pharmacist: "bg-green-500/10 text-green-500",
      admin: "bg-red-500/10 text-red-500",
    };
    return colors[role] || "bg-gray-500/10 text-gray-500";
  };

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
        <AddUserDialog />
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

      {/* Stats and Referral Section */}
      {!loading && (
        <>
          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Manage and approve network users
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <UserFiltersClient users={displayUsers} />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Cards Column */}
            <div className="lg:col-span-1 space-y-4">
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

            {/* Referral Card Column */}
            <div className="lg:col-span-2">
              <ReferralCard referralCode="MFR-REF-2025-001" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UsersPage;
