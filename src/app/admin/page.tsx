"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Factory, Truck, Package, Users } from "lucide-react";
import { useSupplyChainContract } from "@/hooks/use-supply-chain-contract";

interface ActivityLog {
  id: string;
  message: string;
  type: "admin" | "manufacturer" | "distributor" | "wholesaler";
  timestamp: Date;
  action: "added" | "removed";
  address?: string;
}

export default function AdminDashboard() {
  const [adminCount, setAdminCount] = useState(0);
  const [manufacturerCount, setManufacturerCount] = useState(0);
  const [distributorCount, setDistributorCount] = useState(0);
  const [wholesalerCount, setWholesalerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [previousLists, setPreviousLists] = useState({
    admins: [] as string[],
    manufacturers: [] as string[],
    distributors: [] as string[],
    wholesalers: [] as string[],
  });

  const { getAdmins, getManufacturers, getDistributors, getWholesalers } =
    useSupplyChainContract();

  // Add activity log
  const addActivity = (message: string, type: ActivityLog["type"], action: "added" | "removed", address?: string) => {
    const newActivity: ActivityLog = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      message,
      type,
      timestamp: new Date(),
      action,
      address,
    };
    console.log("Adding activity:", newActivity); // Debug log
    setActivityLogs((prev) => {
      const updated = [newActivity, ...prev].slice(0, 10); // Keep last 10
      return updated;
    });
  };

  // Fetch all counts from contract
  const fetchCounts = async () => {
    try {
      setError(null);

      const [admins, manufacturers, distributors, wholesalers] = await Promise.all([
        getAdmins(),
        getManufacturers(),
        getDistributors(),
        getWholesalers(),
      ]);

      const adminsList = admins || [];
      const manufacturersList = manufacturers || [];
      const distributorsList = distributors || [];
      const wholesalersList = wholesalers || [];

      // Compare lists and detect added/removed addresses
      setPreviousLists((prevLists) => {
        // Check for added/removed admins
        const newAdmins = adminsList.filter((addr: string) => !prevLists.admins.includes(addr));
        const removedAdmins = prevLists.admins.filter((addr: string) => !adminsList.includes(addr));
        
        newAdmins.forEach((addr: string) => {
          addActivity(`Admin added: ${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`, "admin", "added", addr);
        });
        removedAdmins.forEach((addr: string) => {
          addActivity(`Admin removed: ${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`, "admin", "removed", addr);
        });

        // Check for added/removed manufacturers
        const newManufacturers = manufacturersList.filter((addr: string) => !prevLists.manufacturers.includes(addr));
        const removedManufacturers = prevLists.manufacturers.filter((addr: string) => !manufacturersList.includes(addr));
        
        newManufacturers.forEach((addr: string) => {
          addActivity(`Manufacturer added: ${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`, "manufacturer", "added", addr);
        });
        removedManufacturers.forEach((addr: string) => {
          addActivity(`Manufacturer removed: ${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`, "manufacturer", "removed", addr);
        });

        // Check for added/removed distributors
        const newDistributors = distributorsList.filter((addr: string) => !prevLists.distributors.includes(addr));
        const removedDistributors = prevLists.distributors.filter((addr: string) => !distributorsList.includes(addr));
        
        newDistributors.forEach((addr: string) => {
          addActivity(`Distributor added: ${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`, "distributor", "added", addr);
        });
        removedDistributors.forEach((addr: string) => {
          addActivity(`Distributor removed: ${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`, "distributor", "removed", addr);
        });

        // Check for added/removed wholesalers
        const newWholesalers = wholesalersList.filter((addr: string) => !prevLists.wholesalers.includes(addr));
        const removedWholesalers = prevLists.wholesalers.filter((addr: string) => !wholesalersList.includes(addr));
        
        newWholesalers.forEach((addr: string) => {
          addActivity(`Wholesaler added: ${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`, "wholesaler", "added", addr);
        });
        removedWholesalers.forEach((addr: string) => {
          addActivity(`Wholesaler removed: ${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`, "wholesaler", "removed", addr);
        });

        return {
          admins: adminsList,
          manufacturers: manufacturersList,
          distributors: distributorsList,
          wholesalers: wholesalersList,
        };
      });

      setAdminCount(adminsList.length);
      setManufacturerCount(manufacturersList.length);
      setDistributorCount(distributorsList.length);
      setWholesalerCount(wholesalersList.length);
      setLastUpdated(new Date());
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch counts:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      setIsLoading(false);
    }
  };

  // Fetch counts on component mount and set up auto-refresh
  useEffect(() => {
    let isMounted = true;

    const runFetch = async () => {
      if (isMounted) {
        await fetchCounts();
      }
    };

    // Initial fetch
    runFetch();

    // Set up auto-refresh every 10 seconds for faster activity detection
    const interval = setInterval(runFetch, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const stats = [
    {
      title: "Total Admins",
      value: adminCount,
      description: "Active administrators",
      icon: Users,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Manufacturers",
      value: manufacturerCount,
      description: "Registered manufacturers",
      icon: Factory,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Distributors",
      value: distributorCount,
      description: "Active distributors",
      icon: Truck,
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Wholesalers",
      value: wholesalerCount,
      description: "Registered wholesalers",
      icon: Package,
      color: "bg-orange-100 text-orange-700",
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500 mt-2">Manage your supply chain network</p>
        </div>
        <div className="text-sm text-gray-500">
          {lastUpdated && (
            <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
          )}
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : stat.value}
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Contract health and network status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Smart Contract</span>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Network</span>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Data Sync</span>
              <Badge className={isLoading ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                {isLoading ? "Updating..." : "Live"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/admin/admins'}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                ➕ Add New Admin
              </button>
              <button 
                onClick={() => window.location.href = '/admin/manufacturers'}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                🏭 Register Manufacturer
              </button>
              <button 
                onClick={() => window.location.href = '/admin/distributors'}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                🚚 Add Distributor
              </button>
              <button 
                onClick={() => window.location.href = '/admin/wholesalers'}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                📦 Add Wholesaler
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest management actions on blockchain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityLogs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No recent activity yet</p>
              </div>
            ) : (
              activityLogs.map((activity) => {
                const getActivityIcon = () => {
                  switch (activity.type) {
                    case "admin":
                      return (
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Users className="h-4 w-4 text-blue-700" />
                        </div>
                      );
                    case "manufacturer":
                      return (
                        <div className="p-2 bg-green-100 rounded-full">
                          <Factory className="h-4 w-4 text-green-700" />
                        </div>
                      );
                    case "distributor":
                      return (
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Truck className="h-4 w-4 text-purple-700" />
                        </div>
                      );
                    case "wholesaler":
                      return (
                        <div className="p-2 bg-orange-100 rounded-full">
                          <Package className="h-4 w-4 text-orange-700" />
                        </div>
                      );
                    default:
                      return (
                        <div className="p-2 bg-gray-100 rounded-full">
                          <Activity className="h-4 w-4 text-gray-700" />
                        </div>
                      );
                  }
                };

                const getTimeAgo = (date: Date) => {
                  const now = new Date();
                  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
                  if (seconds < 60) return "just now";
                  const minutes = Math.floor(seconds / 60);
                  if (minutes < 60) return `${minutes}m ago`;
                  const hours = Math.floor(minutes / 60);
                  if (hours < 24) return `${hours}h ago`;
                  const days = Math.floor(hours / 24);
                  return `${days}d ago`;
                };

                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 pb-4 border-b last:border-b-0"
                  >
                    {getActivityIcon()}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <Badge 
                          className={activity.action === "added" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {activity.action === "added" ? "Added" : "Removed"}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {getTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
