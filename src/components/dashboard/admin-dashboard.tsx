"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Users,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DashboardChart from "./dashboard-chart";

interface DashboardStats {
  products: {
    total: number;
    verified: number;
    pending: number;
    expired: number;
    lowStock: number;
  };
  transactions: {
    total: number;
    confirmed: number;
    pending: number;
    failed: number;
  };
  users: {
    total: number;
    pending: number;
    manufacturers: number;
    distributors: number;
    pharmacists: number;
    wholesalers: number;
    admins: number;
  };
  recentProducts: {
    id: number;
    productCode: string;
    name: string;
    category: string | null;
    batch: string | null;
    stock: number;
    status: string;
    manufacturerName: string | null;
    createdAt: string;
  }[];
  recentTransactions: {
    id: number;
    action: string;
    status: string;
    txHash: string | null;
    createdAt: string;
    productName: string | null;
    productCode: string | null;
    fromUserName: string | null;
    toUserName: string | null;
  }[];
  supplyChainSummary: {
    totalRelations: number;
    downstreamCount: number;
    upstreamCount: number;
  };
}

const statusColors: Record<string, string> = {
  Verified: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  Pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  Expired: "bg-red-500/15 text-red-700 dark:text-red-400",
  Confirmed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  Failed: "bg-red-500/15 text-red-700 dark:text-red-400",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) setStats(await res.json());
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Products",
      value: stats?.products.total ?? 0,
      icon: Package,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Total Transactions",
      value: stats?.transactions.total ?? 0,
      icon: Truck,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      label: "Active Users",
      value: stats?.users.total ?? 0,
      icon: Users,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Pending Approvals",
      value: stats?.users.pending ?? 0,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-card rounded-xl border border-border p-5 flex items-start gap-4"
            >
              <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-foreground mt-0.5">
                  {loading ? "..." : stat.value.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardChart title="System-wide Activity" description="All transactions over the last 30 days" />
        </div>

        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h3 className="text-base font-semibold text-foreground">
            Platform Overview
          </h3>
          <div className="space-y-3">
            {[
              { label: "Manufacturers", value: stats?.users.manufacturers ?? 0, icon: "🏭" },
              { label: "Distributors", value: stats?.users.distributors ?? 0, icon: "🚚" },
              { label: "Wholesalers", value: stats?.users.wholesalers ?? 0, icon: "🏢" },
              { label: "Pharmacists", value: stats?.users.pharmacists ?? 0, icon: "💊" },
              { label: "Admins", value: stats?.users.admins ?? 0, icon: "🛡️" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <span className="text-sm font-semibold">{loading ? "..." : item.value}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Verified Products
              </span>
              <span className="font-semibold">{stats?.products.verified ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Low Stock
              </span>
              <span className="font-semibold">{stats?.products.lowStock ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-violet-500" /> Supply Relations
              </span>
              <span className="font-semibold">{stats?.supplyChainSummary.totalRelations ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Products + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Recent Products</h3>
            <Link href="/products">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          {!stats?.recentProducts.length ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No products yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.productCode} · {p.manufacturerName ?? "Unknown"}
                    </p>
                  </div>
                  <Badge className={`text-[10px] ${statusColors[p.status] ?? ""}`} variant="secondary">
                    {p.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Recent Transactions</h3>
            <Link href="/transactions">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          {!stats?.recentTransactions.length ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{tx.action}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {tx.productName ?? "N/A"} · {tx.fromUserName ?? "—"} → {tx.toUserName ?? "—"}
                    </p>
                  </div>
                  <Badge className={`text-[10px] ${statusColors[tx.status] ?? ""}`} variant="secondary">
                    {tx.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-base font-semibold text-foreground mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/users"><Button variant="secondary" size="sm"><Users className="h-4 w-4 mr-1.5" /> Manage Users</Button></Link>
          <Link href="/products"><Button variant="secondary" size="sm"><Package className="h-4 w-4 mr-1.5" /> View Products</Button></Link>
          <Link href="/transactions"><Button variant="secondary" size="sm"><Truck className="h-4 w-4 mr-1.5" /> View Transactions</Button></Link>
        </div>
      </div>
    </div>
  );
}
