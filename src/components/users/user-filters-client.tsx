"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserFilters } from "./user-filters";
import { UserActions } from "./user-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Wallet ID</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No users found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">
                          {user.fullName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getRoleBadgeColor(user.role)}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{user.organization}</TableCell>
                  <TableCell className="text-sm">{user.phone}</TableCell>
                  <TableCell className="text-sm break-all">
                    {user.walletId}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserActions userId={user.id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
