"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckIcon, PlusIcon, QrCode, ShoppingCart, Verified, WarehouseIcon } from "lucide-react";
import Calendar27 from "./BarChart";

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
    manufacturers: number;
    distributors: number;
    pharmacists: number;
    admins: number;
  };
}

export default function SupplyChainDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
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
    },
    {
      label: "Transactions Processed",
      value: stats?.transactions.total ?? 0,
    },
    {
      label: "Active Users",
      value: stats?.users.total ?? 0,
    },
  ];

  const activities = [
    {
      icon: <PlusIcon />,
      title: "Product Added",
      detail: `${stats?.products.pending ?? 0} pending verification`,
      color: "bg-primary/20 text-primary",
    },
    {
      icon: <ShoppingCart />,
      title: "Products Verified",
      detail: `${stats?.products.verified ?? 0} verified products`,
      color: "bg-primary/20 text-primary",
    },
    {
      icon: <WarehouseIcon />,
      title: "Transactions Confirmed",
      detail: `${stats?.transactions.confirmed ?? 0} confirmed`,
      color: "bg-primary/20 text-primary",
    },
    {
      icon: <CheckIcon />,
      title: "Low Stock Alerts",
      detail: `${stats?.products.lowStock ?? 0} products with low stock`,
      color: "bg-primary/20 text-primary",
    },
    {
      icon: <CheckIcon />,
      title: "Expired Products",
      detail: `${stats?.products.expired ?? 0} expired`,
      color: "bg-primary/20 text-primary",
      isLast: true,
    },
  ];

  return (
    <div className="flex-1 bg-background">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4 flex-wrap">
          

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                className="flex items-center gap-2 rounded-lg shadow-sm"
              >
                <QrCode />
                Track Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Track Product</DialogTitle>
                <DialogDescription>
                  Enter the product or tracking ID to view its journey.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div>
                  <Label className="mb-1 block">Tracking ID</Label>
                  <Input placeholder="Enter tracking ID" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Track</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                className="flex items-center gap-2 rounded-lg shadow-sm"
              >
                <Verified />
                Verify Authenticity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Verify Product Authenticity</DialogTitle>
                <DialogDescription>
                  Enter the product's unique ID or scan its QR code to verify.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-5 mt-5">
                <div>
                  <Label className="mb-1 block">Product ID</Label>
                  <Input placeholder="Enter product ID" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Verify</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-xl border border-border"
            >
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {loading ? "..." : stat.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Calendar27 />
          </div>

          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Supply Chain Overview
            </h3>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full ${activity.color} flex items-center justify-center`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {activity.icon}
                      </span>
                    </div>
                    {!activity.isLast && (
                      <div className="w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
