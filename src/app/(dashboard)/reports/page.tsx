"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  TrendingUp,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const ReportsPage = () => {
  const [timeRange, setTimeRange] = useState("30days");
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/reports?timeRange=${timeRange}`);
        if (!res.ok) throw new Error("Failed to fetch reports data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [timeRange]);

  const chartConfig = {
    completed: { label: "Completed", color: "#10b981" },
    pending: { label: "Pending", color: "#f59e0b" },
    delayed: { label: "Delayed", color: "#ef4444" },
    transactions: { label: "Transactions", color: "#3b82f6" },
    value: { label: "Value (USD)", color: "#8b5cf6" },
    onTime: { label: "On Time", color: "#10b981" },
  };

  if (isLoading || !data) {
    return (
      <div className="flex-1 p-6 bg-background space-y-6 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading report data...</p>
        </div>
      </div>
    );
  }

  const {
    performanceData,
    statusData,
    transactionData,
    topProducts,
    metrics,
    partnersData,
    summary
  } = data;


  const iconMap: Record<string, any> = {
    Zap,
    CheckCircle,
    Clock,
    AlertTriangle,
    TrendingUp,
    Package
  };

  return (
    <div className="flex-1 p-6 bg-background space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-2">
            Supply chain analytics and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric: any) => {
          const Icon = iconMap[metric.icon] || Package;
          return (
            <Card key={metric.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>{metric.title}</span>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{metric.value}</div>
                <p className="text-xs text-green-600 mt-1">{metric.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supply Chain Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Supply Chain Performance</CardTitle>
            <CardDescription>
              Completed, Pending, and Delayed shipments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={performanceData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" radius={4} />
                <Bar dataKey="pending" fill="#f59e0b" radius={4} />
                <Bar dataKey="delayed" fill="#ef4444" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Product Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Product Status</CardTitle>
            <CardDescription>Current distribution</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <PieChart width={300} height={300}>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume & Value</CardTitle>
            <CardDescription>Daily blockchain transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={transactionData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="transactions"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>By sales volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.length === 0 && (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  No top products found for this period.
                </div>
              )}
              {topProducts.map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        product.status === "Verified"
                          ? "default"
                          : product.status === "Pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {product.status}
                    </Badge>
                    <span className="text-sm font-semibold">
                      {product.sales}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Partner Performance</CardTitle>
            <CardDescription>On-time delivery rate</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={partnersData} layout="vertical">
                <CartesianGrid vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="partner" type="category" width={120} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="onTime" fill="#10b981" radius={4} />
                <Bar dataKey="delayed" fill="#ef4444" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  Average Processing Time
                </p>
                <p className="text-2xl font-bold mt-1">
                  {summary?.avgProcessingTime || "-"}
                </p>
                <p className={`text-xs mt-1 ${summary?.avgProcessingTimeChange?.startsWith("-") ? "text-green-600" : "text-red-600"}`}>
                  {summary?.avgProcessingTimeChange} from last period
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  On-Time Delivery Rate
                </p>
                <p className="text-2xl font-bold mt-1">
                  {summary?.onTimeDeliveryRate || "-"}
                </p>
                <p className={`text-xs mt-1 ${summary?.onTimeDeliveryRateChange?.startsWith("+") || summary?.onTimeDeliveryRateChange === "0%" ? "text-green-600" : "text-red-600"}`}>
                  {summary?.onTimeDeliveryRateChange} from last period
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Blockchain Verification Rate
                </p>
                <p className="text-2xl font-bold mt-1">
                  {summary?.blockchainVerificationRate || "-"}
                </p>
                <p className={`text-xs mt-1 ${summary?.blockchainVerificationRateChange?.startsWith("-") ? "text-red-600" : "text-green-600"}`}>
                  {summary?.blockchainVerificationRateChange} from last period
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
