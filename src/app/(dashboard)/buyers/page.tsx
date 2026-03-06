"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Spinner } from "@/components/ui/spinner";
import {
  Link2,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/contexts/user-context";
import axios from "axios";

// Roles to manage based on the current user's role
const ALLOWED_BUYER_ROLES: Record<string, string[]> = {
  manufacturer: ["distributor", "wholesaler"],
  distributor: ["pharmacist"],
};

interface Relation {
  id: number;
  supplyFrom: number;
  supplyTo: number;
  createdAt: string;
}

interface UserInfo {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  organization: string;
  walletId: string;
  status: string;
}

const PAGE_SIZE = 8;

export default function BuyersPage() {
  const { user: currentUser, isLoading: userLoading } = useUser();
  const router = useRouter();

  // Data state
  const [relations, setRelations] = useState<Relation[]>([]);
  const [allUsers, setAllUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add buyer form
  const [selectedUserId, setSelectedUserId] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // Remove buyer
  const [removeTarget, setRemoveTarget] = useState<{
    relationId: number;
    userName: string;
  } | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  // Pagination & search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const allowedRoles = currentUser
    ? ALLOWED_BUYER_ROLES[currentUser.role] ?? []
    : [];

  const isAuthorized =
    !userLoading &&
    currentUser != null &&
    (currentUser.role === "manufacturer" || currentUser.role === "distributor");

  // Redirect unauthorized
  useEffect(() => {
    if (!userLoading && currentUser && !isAuthorized) {
      router.replace("/dashboard");
    }
  }, [currentUser, userLoading, isAuthorized, router]);

  // Fetch relations + users
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [relRes, usersRes] = await Promise.all([
        axios.get<Relation[]>("/api/supply-relations"),
        axios.get<UserInfo[]>("/api/user"),
      ]);

      setRelations(relRes.data);
      setAllUsers(usersRes.data);
    } catch (err) {
      let msg = "Failed to load data";
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        msg = err.response.data.error;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) fetchData();
  }, [isAuthorized, fetchData]);

  // Derived: buyer IDs = supplyTo where supplyFrom is current user
  const myBuyerRelations = useMemo(
    () =>
      relations.filter((r) => r.supplyFrom === currentUser?.id),
    [relations, currentUser?.id],
  );

  const myBuyerIds = useMemo(
    () => new Set(myBuyerRelations.map((r) => r.supplyTo)),
    [myBuyerRelations],
  );

  // Buyers enriched with user info
  const buyers = useMemo(() => {
    const userMap = new Map(allUsers.map((u) => [u.id, u]));
    return myBuyerRelations
      .map((rel) => ({
        ...rel,
        user: userMap.get(rel.supplyTo),
      }))
      .filter((b) => b.user != null);
  }, [myBuyerRelations, allUsers]);

  // Filtered & paginated buyers
  const filteredBuyers = useMemo(() => {
    if (!searchQuery.trim()) return buyers;
    const q = searchQuery.toLowerCase();
    return buyers.filter(
      (b) =>
        b.user!.fullName.toLowerCase().includes(q) ||
        b.user!.organization.toLowerCase().includes(q) ||
        b.user!.email?.toLowerCase().includes(q) ||
        b.user!.role.toLowerCase().includes(q),
    );
  }, [buyers, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredBuyers.length / PAGE_SIZE));
  const paginatedBuyers = filteredBuyers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Reset page on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Available users to add (active, correct role, not already a buyer)
  const availableUsers = useMemo(
    () =>
      allUsers.filter(
        (u) =>
          u.status === "active" &&
          allowedRoles.includes(u.role) &&
          !myBuyerIds.has(u.id) &&
          u.id !== currentUser?.id,
      ),
    [allUsers, allowedRoles, myBuyerIds, currentUser?.id],
  );

  // Add buyer handler
  const handleAddBuyer = async () => {
    if (!selectedUserId) return;
    setAdding(true);
    setAddError(null);
    setAddSuccess(null);
    try {
      await axios.post("/api/supply-relations", {
        supplyToId: Number(selectedUserId),
      });
      const addedUser = allUsers.find(
        (u) => u.id === Number(selectedUserId),
      );
      setAddSuccess(
        `Successfully added ${addedUser?.fullName ?? "user"} as a buyer.`,
      );
      setSelectedUserId("");
      await fetchData();
    } catch (err) {
      let msg = "Failed to add buyer";
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        msg = err.response.data.error;
      }
      setAddError(msg);
    } finally {
      setAdding(false);
    }
  };

  // Remove buyer handler
  const handleRemoveBuyer = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    setRemoveError(null);
    try {
      await axios.delete(`/api/supply-relations/${removeTarget.relationId}`);
      setRemoveTarget(null);
      await fetchData();
    } catch (err) {
      let msg = "Failed to remove buyer";
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        msg = err.response.data.error;
      }
      setRemoveError(msg);
    } finally {
      setRemoving(false);
    }
  };

  // --- Early returns ---
  if (userLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner className="h-8 w-8 mb-3" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  const roleLabel =
    currentUser!.role === "manufacturer"
      ? "Distributors & Wholesalers"
      : "Pharmacists";

  return (
    <div className="p-6 bg-background space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Link2 className="h-7 w-7" />
          My Buyers
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your downstream supply chain partners ({roleLabel})
        </p>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="border-red-500/50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="ml-2 hover:bg-red-500/10"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Add Buyer Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Buyer
          </CardTitle>
          <CardDescription>
            Select an active {roleLabel.toLowerCase()} to add to your buyer
            list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="buyer-select" className="sr-only">
                Select Buyer
              </Label>
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
              >
                <SelectTrigger id="buyer-select">
                  <SelectValue placeholder="Choose a user to add" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground text-center">
                      No available users to add
                    </div>
                  ) : (
                    availableUsers.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.fullName} — {u.organization} ({u.role})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddBuyer}
              disabled={!selectedUserId || adding}
              className="cursor-pointer"
            >
              {adding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Buyer
                </>
              )}
            </Button>
          </div>

          {addError && (
            <p className="text-sm text-red-500 mt-2">{addError}</p>
          )}
          {addSuccess && (
            <p className="text-sm text-green-600 mt-2">{addSuccess}</p>
          )}
        </CardContent>
      </Card>

      {/* Buyers Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Buyer List
                <Badge variant="secondary" className="ml-1">
                  {buyers.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Your current downstream supply chain partners
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search buyers…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner className="h-6 w-6 mb-2" />
              <p className="text-muted-foreground text-sm">
                Loading buyers…
              </p>
            </div>
          ) : paginatedBuyers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery
                ? "No buyers match your search."
                : "No buyers added yet. Use the form above to add your first buyer."}
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">
                        Organization
                      </th>
                      <th className="text-left p-3 font-medium">Role</th>
                      <th className="text-left p-3 font-medium">Email</th>
                      <th className="text-left p-3 font-medium">Wallet</th>
                      <th className="text-right p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBuyers.map((b) => (
                      <tr
                        key={b.id}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-3 font-medium">
                          {b.user!.fullName}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {b.user!.organization}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="capitalize">
                            {b.user!.role}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {b.user!.email ?? "—"}
                        </td>
                        <td className="p-3">
                          <Badge
                            variant="secondary"
                            className="font-mono text-xs"
                          >
                            {b.user!.walletId.slice(0, 6)}…
                            {b.user!.walletId.slice(-4)}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                            onClick={() => {
                              setRemoveError(null);
                              setRemoveTarget({
                                relationId: b.id,
                                userName: b.user!.fullName,
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages} ({filteredBuyers.length}{" "}
                    results)
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={currentPage <= 1}
                      onClick={() =>
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(totalPages, p + 1),
                        )
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Remove confirmation dialog */}
      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Buyer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-foreground">
                {removeTarget?.userName}
              </span>{" "}
              from your buyers list? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {removeError && (
            <p className="text-sm text-red-500 px-1">{removeError}</p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={removing}
              onClick={() => setRemoveTarget(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRemoveBuyer();
              }}
              disabled={removing}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {removing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing…
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
}
