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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  status: "Active" | "Pending" | "Suspended";
  joinedDate: string;
  referredBy?: string;
  phone: string;
}

const UsersPage = async () => {
  // Mock data - In real app, fetch from API/database
  const users: User[] = [
    {
      id: "USR-001",
      name: "Rajesh Kumar",
      email: "rajesh@pharmachain.io",
      role: "Manufacturer",
      company: "PharmaChain Labs",
      status: "Active",
      joinedDate: "2025-01-15",
      phone: "+91 98765 43210",
    },
    {
      id: "USR-002",
      name: "Priya Sharma",
      email: "priya@medidistribute.com",
      role: "Distributor",
      company: "MediDistribute Inc",
      status: "Active",
      joinedDate: "2025-02-20",
      referredBy: "MFR-REF-2025-001",
      phone: "+91 98765 43211",
    },
    {
      id: "USR-003",
      name: "Amit Patel",
      email: "amit@pharmabulk.com",
      role: "Wholesaler",
      company: "PharmaBulk Solutions",
      status: "Active",
      joinedDate: "2025-03-10",
      referredBy: "MFR-REF-2025-001",
      phone: "+91 98765 43212",
    },
    {
      id: "USR-004",
      name: "Sneha Reddy",
      email: "sneha@healthcare.com",
      role: "Pharmacy",
      company: "HealthCare Pharmacy",
      status: "Pending",
      joinedDate: "2025-10-28",
      referredBy: "MFR-REF-2025-001",
      phone: "+91 98765 43213",
    },
    {
      id: "USR-005",
      name: "Vikram Singh",
      email: "vikram@medstore.com",
      role: "Pharmacy",
      company: "MedStore Plus",
      status: "Suspended",
      joinedDate: "2025-05-12",
      phone: "+91 98765 43214",
    },
    {
      id: "USR-006",
      name: "Anita Desai",
      email: "anita@wellcure.com",
      role: "Distributor",
      company: "WellCure Pharma",
      status: "Pending",
      joinedDate: "2025-10-29",
      referredBy: "MFR-REF-2025-001",
      phone: "+91 98765 43215",
    },
  ];

  const stats = [
    {
      title: "Total Users",
      value: users.length.toString(),
      icon: UsersIcon,
      color: "text-blue-500",
    },
    {
      title: "Active Users",
      value: users.filter((u) => u.status === "Active").length.toString(),
      icon: UserCheck,
      color: "text-green-500",
    },
    {
      title: "Pending Approval",
      value: users.filter((u) => u.status === "Pending").length.toString(),
      icon: Clock,
      color: "text-orange-500",
    },
    {
      title: "Suspended",
      value: users.filter((u) => u.status === "Suspended").length.toString(),
      icon: UserX,
      color: "text-red-500",
    },
  ];

  const referralCode = "MFR-REF-2025-001";

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      Manufacturer: "bg-purple-500/10 text-purple-500",
      Distributor: "bg-blue-500/10 text-blue-500",
      Wholesaler: "bg-cyan-500/10 text-cyan-500",
      Pharmacy: "bg-green-500/10 text-green-500",
      Admin: "bg-red-500/10 text-red-500",
    };
    return colors[role] || "bg-gray-500/10 text-gray-500";
  };

  const getStatusBadge = (status: User["status"]) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      Active: "default",
      Pending: "secondary",
      Suspended: "destructive",
    };
    return variants[status] || "secondary";
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

      {/* Stats and Referral Section */}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage and approve network users</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <UserFiltersClient users={users} />
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
                      {stat.title}{":"}
                      <span className="text-base font-bold">{stat.value}</span>
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
          <ReferralCard referralCode={referralCode} />
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
