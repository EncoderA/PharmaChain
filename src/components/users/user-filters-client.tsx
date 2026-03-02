"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserFilters } from "./user-filters";
import { UserActions } from "./user-actions";
import { DataTable } from "@/components/ui/data-table";

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: "manufacturer" | "distributor" | "pharmacist" | "admin";
  organization: string;
  walletId: string;
}

interface UserFiltersClientProps {
  users: User[];
}

const getRoleBadgeColor = (role: string) => {
  const colors: Record<string, string> = {
    manufacturer: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    distributor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    pharmacist: "bg-green-500/10 text-green-500 border-green-500/20",
    admin: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return colors[role] || "bg-gray-500/10 text-gray-500";
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "fullName",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">{user.fullName}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant="outline" className={getRoleBadgeColor(row.original.role)}>
        {row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: "organization",
    header: "Organization",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.organization}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <span className="text-sm">{row.original.phone}</span>,
  },
  {
    accessorKey: "walletId",
    header: "Wallet ID",
    cell: ({ row }) => (
      <span className="text-sm break-all">{row.original.walletId}</span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="text-right block">Actions</span>,
    cell: ({ row }) => (
      <div className="text-right">
        <UserActions userId={row.original.id} />
      </div>
    ),
  },
];

export function UserFiltersClient({ users }: UserFiltersClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.organization.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "all" || user.role.toLowerCase() === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4 p-6">
      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
      />

      <div className="text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      <DataTable columns={columns} data={filteredUsers} />
    </div>
  );
}
