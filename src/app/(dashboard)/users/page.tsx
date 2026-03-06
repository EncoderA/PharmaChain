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
import {
  Users as UsersIcon,
  UserCheck,
  UserX,
  Store,
  Search,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/contexts/user-context";
import axios from "axios";

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: "manufacturer" | "distributor" | "pharmacist" | "wholesaler" | "admin";
  organization: string;
  walletId: string;
  status: "active" | "pending" | "rejected";
}

const PAGE_SIZE = 10;

const ROLE_BADGE_MAP: Record<string, string> = {
  admin: "text-red-700 border-red-300 bg-red-50 dark:text-red-400 dark:border-red-800 dark:bg-red-950",
  manufacturer: "text-blue-700 border-blue-300 bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:bg-blue-950",
  distributor: "text-orange-700 border-orange-300 bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:bg-orange-950",
  wholesaler: "text-purple-700 border-purple-300 bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:bg-purple-950",
  pharmacist: "text-green-700 border-green-300 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950",
};

const STATUS_BADGE_MAP: Record<string, { className: string; icon: typeof CheckCircle }> = {
  active: { className: "text-green-700 border-green-300 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950", icon: CheckCircle },
  pending: { className: "text-yellow-700 border-yellow-300 bg-yellow-50 dark:text-yellow-400 dark:border-yellow-800 dark:bg-yellow-950", icon: Loader2 },
  rejected: { className: "text-red-700 border-red-300 bg-red-50 dark:text-red-400 dark:border-red-800 dark:bg-red-950", icon: XCircle },
};

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser, isLoading: userLoading } = useUser();
  const router = useRouter();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Status-change state
  const [statusChangeTarget, setStatusChangeTarget] = useState<{ user: User; newStatus: "active" | "rejected" } | null>(null);
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusChangeError, setStatusChangeError] = useState<string | null>(null);

  const isAuthorized = !userLoading && currentUser?.role === "admin";

  // Redirect non-admins
  useEffect(() => {
    if (!userLoading && currentUser && currentUser.role !== "admin") {
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
      let msg = "Failed to fetch users";
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        msg = err.response.data.error;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) fetchUsers();
  }, [isAuthorized, fetchUsers]);

  // Filtered and paginated users
  const filteredUsers = useMemo(() => {
    let list = users;
    if (roleFilter !== "all") list = list.filter((u) => u.role === roleFilter);
    if (statusFilter !== "all") list = list.filter((u) => u.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.organization.toLowerCase().includes(q) ||
          u.walletId.toLowerCase().includes(q),
      );
    }
    return list;
  }, [users, roleFilter, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter]);

  // --- Handlers ---

  const handleChangeStatus = async () => {
    if (!statusChangeTarget) return;
    setChangingStatus(true);
    setStatusChangeError(null);
    try {
      await axios.patch(`/api/user/${statusChangeTarget.user.id}`, {
        status: statusChangeTarget.newStatus,
      });
      setStatusChangeTarget(null);
      await fetchUsers();
    } catch (err) {
      let msg = "Failed to change status";
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        msg = err.response.data.error;
      }
      setStatusChangeError(msg);
    } finally {
      setChangingStatus(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await axios.delete(`/api/user/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchUsers();
    } catch (err) {
      let msg = "Failed to delete user";
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        msg = err.response.data.error;
      }
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  };

  // --- Stats ---
  const pendingCount = users.filter((u) => u.status === "pending").length;
  const activeCount = users.filter((u) => u.status === "active").length;
  const rejectedCount = users.filter((u) => u.status === "rejected").length;

  const stats = [
    { title: "Total Users", value: users.length, icon: UsersIcon, color: "text-blue-500" },
    { title: "Active", value: activeCount, icon: UserCheck, color: "text-green-500" },
    { title: "Pending", value: pendingCount, icon: Loader2, color: "text-yellow-500" },
    { title: "Rejected", value: rejectedCount, icon: UserX, color: "text-red-500" },
  ];

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

  return (
    <div className="p-6 bg-background space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-7 w-7" />
          User Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Approve, reject, or remove users from the supply chain network
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.title}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.title}</p>
                    <p className="text-2xl font-bold">{loading ? "…" : s.value}</p>
                  </div>
                  <Icon className={`h-6 w-6 ${s.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="border-red-500/50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchUsers} className="ml-2 hover:bg-red-500/10">
              <RotateCcw className="h-4 w-4 mr-1" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, organization, or wallet…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manufacturer">Manufacturer</SelectItem>
            <SelectItem value="distributor">Distributor</SelectItem>
            <SelectItem value="wholesaler">Wholesaler</SelectItem>
            <SelectItem value="pharmacist">Pharmacist</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            All Users
            <Badge variant="secondary" className="ml-1">{filteredUsers.length}</Badge>
          </CardTitle>
          <CardDescription>
            Manage user accounts — approve pending registrations, reject or remove users
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner className="h-6 w-6 mb-2" />
              <p className="text-muted-foreground text-sm">Loading users…</p>
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                ? "No users match your filters."
                : "No users found."}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Organization</th>
                      <th className="text-left p-3 font-medium">Role</th>
                      <th className="text-left p-3 font-medium">Email</th>
                      <th className="text-left p-3 font-medium">Wallet</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-right p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((u) => {
                      const statusConf = STATUS_BADGE_MAP[u.status];
                      const StatusIcon = statusConf.icon;
                      const isSelf = u.id === currentUser!.id;

                      return (
                        <tr key={u.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-medium">
                            {u.fullName}
                            {isSelf && (
                              <span className="text-xs text-muted-foreground ml-1">(you)</span>
                            )}
                          </td>
                          <td className="p-3 text-muted-foreground">{u.organization}</td>
                          <td className="p-3">
                            <Badge variant="outline" className={`capitalize ${ROLE_BADGE_MAP[u.role] ?? ""}`}>
                              {u.role}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">{u.email ?? "—"}</td>
                          <td className="p-3">
                            <Badge variant="secondary" className="font-mono text-xs">
                              {u.walletId.slice(0, 6)}…{u.walletId.slice(-4)}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className={`flex items-center gap-1 w-fit capitalize ${statusConf.className}`}>
                              <StatusIcon className={`h-3 w-3 ${u.status === "pending" ? "animate-spin" : ""}`} />
                              {u.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-1">
                              {/* Approve button — shown for pending users */}
                              {u.status === "pending" && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                                        onClick={() => {
                                          setStatusChangeError(null);
                                          setStatusChangeTarget({ user: u, newStatus: "active" });
                                        }}
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Approve user</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              {/* Reject button — shown for pending or active users (not self) */}
                              {(u.status === "pending" || u.status === "active") && !isSelf && u.role !== "admin" && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-500/10"
                                        onClick={() => {
                                          setStatusChangeError(null);
                                          setStatusChangeTarget({ user: u, newStatus: "rejected" });
                                        }}
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Reject user</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              {/* Re-activate button — shown for rejected users */}
                              {u.status === "rejected" && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                                        onClick={() => {
                                          setStatusChangeError(null);
                                          setStatusChangeTarget({ user: u, newStatus: "active" });
                                        }}
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Re-activate user</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              {/* Delete button — not shown for self or other admins */}
                              {!isSelf && u.role !== "admin" && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                        onClick={() => {
                                          setDeleteError(null);
                                          setDeleteTarget(u);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete user</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages} ({filteredUsers.length} results)
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

      {/* Status Change Confirmation */}
      <AlertDialog
        open={!!statusChangeTarget}
        onOpenChange={(open) => { if (!open) setStatusChangeTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusChangeTarget?.newStatus === "active" ? "Approve" : "Reject"} User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {statusChangeTarget?.newStatus === "active" ? "approve" : "reject"}{" "}
              <span className="font-semibold text-foreground">{statusChangeTarget?.user.fullName}</span>?
              {statusChangeTarget?.newStatus === "active"
                ? " This will allow them to log in and use the platform."
                : " This will prevent them from logging in."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {statusChangeError && (
            <p className="text-sm text-red-500 px-1">{statusChangeError}</p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={changingStatus} onClick={() => setStatusChangeTarget(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleChangeStatus(); }}
              disabled={changingStatus}
              className={
                statusChangeTarget?.newStatus === "active"
                  ? "bg-green-600 hover:bg-green-700 focus:ring-green-600"
                  : "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-600"
              }
            >
              {changingStatus ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing…</>
              ) : statusChangeTarget?.newStatus === "active" ? (
                "Approve"
              ) : (
                "Reject"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.fullName}</span>?
              This will remove the user and clean up all their associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteError && (
            <p className="text-sm text-red-500 px-1">{deleteError}</p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} onClick={() => setDeleteTarget(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDeleteUser(); }}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting…</>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersPage;
