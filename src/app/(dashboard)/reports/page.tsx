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

  // All data for different time ranges
  const allPerformanceData = {
    "7days": [
      { month: "Day 1", completed: 35, pending: 8, delayed: 2 },
      { month: "Day 2", completed: 42, pending: 6, delayed: 1 },
      { month: "Day 3", completed: 38, pending: 9, delayed: 3 },
      { month: "Day 4", completed: 45, pending: 5, delayed: 2 },
      { month: "Day 5", completed: 40, pending: 7, delayed: 1 },
      { month: "Day 6", completed: 48, pending: 6, delayed: 2 },
      { month: "Day 7", completed: 50, pending: 4, delayed: 1 },
    ],
    "30days": [
      { month: "Week 1", completed: 280, pending: 45, delayed: 12 },
      { month: "Week 2", completed: 320, pending: 38, delayed: 8 },
      { month: "Week 3", completed: 295, pending: 42, delayed: 15 },
      { month: "Week 4", completed: 340, pending: 35, delayed: 10 },
    ],
    "90days": [
      { month: "Jan", completed: 120, pending: 25, delayed: 8 },
      { month: "Feb", completed: 145, pending: 18, delayed: 5 },
      { month: "Mar", completed: 165, pending: 22, delayed: 12 },
    ],
    "1year": [
      { month: "Jan", completed: 120, pending: 25, delayed: 8 },
      { month: "Feb", completed: 145, pending: 18, delayed: 5 },
      { month: "Mar", completed: 165, pending: 22, delayed: 12 },
      { month: "Apr", completed: 140, pending: 30, delayed: 10 },
      { month: "May", completed: 190, pending: 15, delayed: 4 },
      { month: "Jun", completed: 210, pending: 20, delayed: 6 },
      { month: "Jul", completed: 185, pending: 28, delayed: 9 },
      { month: "Aug", completed: 220, pending: 22, delayed: 7 },
      { month: "Sep", completed: 195, pending: 25, delayed: 11 },
      { month: "Oct", completed: 240, pending: 18, delayed: 5 },
      { month: "Nov", completed: 225, pending: 20, delayed: 8 },
      { month: "Dec", completed: 250, pending: 15, delayed: 6 },
    ],
  };

  const allStatusData = {
    "7days": [
      { name: "Verified", value: 298, color: "#10b981" },
      { name: "Pending", value: 45, color: "#f59e0b" },
      { name: "Expired", value: 12, color: "#ef4444" },
    ],
    "30days": [
      { name: "Verified", value: 1235, color: "#10b981" },
      { name: "Pending", value: 160, color: "#f59e0b" },
      { name: "Expired", value: 45, color: "#ef4444" },
    ],
    "90days": [
      { name: "Verified", value: 3680, color: "#10b981" },
      { name: "Pending", value: 420, color: "#f59e0b" },
      { name: "Expired", value: 125, color: "#ef4444" },
    ],
    "1year": [
      { name: "Verified", value: 15420, color: "#10b981" },
      { name: "Pending", value: 1680, color: "#f59e0b" },
      { name: "Expired", value: 520, color: "#ef4444" },
    ],
  };

  const allTransactionData = {
    "7days": [
      { date: "Oct 23", transactions: 156, value: 24800 },
      { date: "Oct 24", transactions: 189, value: 31200 },
      { date: "Oct 25", transactions: 210, value: 38900 },
      { date: "Oct 26", transactions: 175, value: 28600 },
      { date: "Oct 27", transactions: 220, value: 40100 },
      { date: "Oct 28", transactions: 245, value: 42800 },
      { date: "Oct 29", transactions: 268, value: 45200 },
    ],
    "30days": [
      { date: "Week 1", transactions: 1100, value: 185000 },
      { date: "Week 2", transactions: 1250, value: 210000 },
      { date: "Week 3", transactions: 1180, value: 195000 },
      { date: "Week 4", transactions: 1320, value: 225000 },
    ],
    "90days": [
      { date: "Month 1", transactions: 4200, value: 680000 },
      { date: "Month 2", transactions: 4850, value: 750000 },
      { date: "Month 3", transactions: 5120, value: 820000 },
    ],
    "1year": [
      { date: "Q1", transactions: 14200, value: 2250000 },
      { date: "Q2", transactions: 16850, value: 2680000 },
      { date: "Q3", transactions: 18120, value: 2950000 },
      { date: "Q4", transactions: 19500, value: 3150000 },
    ],
  };

  const allMetrics = {
    "7days": [
      {
        title: "Total Transactions",
        value: "1,465",
        change: "+8.5%",
        icon: Zap,
        color: "text-blue-500",
      },
      {
        title: "Products Verified",
        value: "298",
        change: "+5.2%",
        icon: CheckCircle,
        color: "text-green-500",
      },
      {
        title: "Pending Verification",
        value: "45",
        change: "-2.1%",
        icon: Clock,
        color: "text-orange-500",
      },
      {
        title: "Alerts",
        value: "12",
        change: "+1.4%",
        icon: AlertTriangle,
        color: "text-red-500",
      },
    ],
    "30days": [
      {
        title: "Total Transactions",
        value: "4,850",
        change: "+12.5%",
        icon: Zap,
        color: "text-blue-500",
      },
      {
        title: "Products Verified",
        value: "1,235",
        change: "+8.2%",
        icon: CheckCircle,
        color: "text-green-500",
      },
      {
        title: "Pending Verification",
        value: "160",
        change: "-3.1%",
        icon: Clock,
        color: "text-orange-500",
      },
      {
        title: "Alerts",
        value: "45",
        change: "+2.4%",
        icon: AlertTriangle,
        color: "text-red-500",
      },
    ],
    "90days": [
      {
        title: "Total Transactions",
        value: "14,170",
        change: "+15.8%",
        icon: Zap,
        color: "text-blue-500",
      },
      {
        title: "Products Verified",
        value: "3,680",
        change: "+10.5%",
        icon: CheckCircle,
        color: "text-green-500",
      },
      {
        title: "Pending Verification",
        value: "420",
        change: "-4.2%",
        icon: Clock,
        color: "text-orange-500",
      },
      {
        title: "Alerts",
        value: "125",
        change: "+3.8%",
        icon: AlertTriangle,
        color: "text-red-500",
      },
    ],
    "1year": [
      {
        title: "Total Transactions",
        value: "68,670",
        change: "+18.2%",
        icon: Zap,
        color: "text-blue-500",
      },
      {
        title: "Products Verified",
        value: "15,420",
        change: "+12.8%",
        icon: CheckCircle,
        color: "text-green-500",
      },
      {
        title: "Pending Verification",
        value: "1,680",
        change: "-5.5%",
        icon: Clock,
        color: "text-orange-500",
      },
      {
        title: "Alerts",
        value: "520",
        change: "+4.2%",
        icon: AlertTriangle,
        color: "text-red-500",
      },
    ],
  };

  const performanceData = allPerformanceData[timeRange as keyof typeof allPerformanceData];
  const statusData = allStatusData[timeRange as keyof typeof allStatusData];
  const transactionData = allTransactionData[timeRange as keyof typeof allTransactionData];
  const metrics = allMetrics[timeRange as keyof typeof allMetrics];

  const topProducts = [
    {
      id: "PRD-001",
      name: "Paracetamol 500mg",
      sales: 1250,
      status: "Verified",
    },
    {
      id: "PRD-002",
      name: "Amoxicillin 250mg",
      sales: 980,
      status: "Verified",
    },
    { id: "PRD-003", name: "Vitamin C 1000mg", sales: 750, status: "Pending" },
    { id: "PRD-004", name: "Ibuprofen 400mg", sales: 620, status: "Expired" },
    { id: "PRD-005", name: "Aspirin 100mg", sales: 540, status: "Verified" },
  ];

  const partnersData = [
    { partner: "PharmaChain Labs", onTime: 98, delayed: 2 },
    { partner: "MediDistribute Inc", onTime: 95, delayed: 5 },
    { partner: "PharmaBulk Solutions", onTime: 92, delayed: 8 },
    { partner: "HealthCare Pharmacy", onTime: 96, delayed: 4 },
  ];

  const chartConfig = {
    completed: { label: "Completed", color: "#10b981" },
    pending: { label: "Pending", color: "#f59e0b" },
    delayed: { label: "Delayed", color: "#ef4444" },
    transactions: { label: "Transactions", color: "#3b82f6" },
    value: { label: "Value (USD)", color: "#8b5cf6" },
    onTime: { label: "On Time", color: "#10b981" },
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
        {metrics.map((metric) => {
          const Icon = metric.icon;
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
                  {statusData.map((entry, index) => (
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
              {topProducts.map((product) => (
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
                <p className="text-2xl font-bold mt-1">2.5 days</p>
                <p className="text-xs text-green-600 mt-1">
                  ↓ 15% from last period
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  On-Time Delivery Rate
                </p>
                <p className="text-2xl font-bold mt-1">94.8%</p>
                <p className="text-xs text-green-600 mt-1">
                  ↑ 3.2% from last period
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Blockchain Verification Rate
                </p>
                <p className="text-2xl font-bold mt-1">99.6%</p>
                <p className="text-xs text-green-600 mt-1">
                  ↑ 0.8% from last period
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
