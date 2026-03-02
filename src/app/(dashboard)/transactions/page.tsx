"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Search,
  Filter,
  Download,
  Copy,
  CheckCircle,
  Clock,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ViewTransactionButton } from "@/components/products/view-transaction-button";
import { DataTable } from "@/components/ui/data-table";

interface Transaction {
  id: number;
  productId: number | null;
  action: string;
  fromUserId: number | null;
  toUserId: number | null;
  txHash: string | null;
  blockNumber: number | null;
  status: "Confirmed" | "Pending" | "Failed";
  createdAt: string;
  productName: string | null;
  productCode: string | null;
  fromUserName: string | null;
  toUserName: string | null;
}

const getStatusConfig = (status: Transaction["status"]) => {
  const config = {
    Confirmed: {
      variant: "default" as const,
      icon: CheckCircle,
      label: "Confirmed",
    },
    Pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
    Failed: { variant: "destructive" as const, icon: Clock, label: "Failed" },
  };
  return config[status];
};

const formatTxHash = (hash: string) => {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Client-side search filtering
  const filteredTransactions = transactions.filter((tx) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (tx.txHash?.toLowerCase().includes(term)) ||
      (tx.productCode?.toLowerCase().includes(term)) ||
      (tx.productName?.toLowerCase().includes(term)) ||
      (tx.action.toLowerCase().includes(term)) ||
      (tx.fromUserName?.toLowerCase().includes(term)) ||
      (tx.toUserName?.toLowerCase().includes(term))
    );
  });

  const copyToClipboard = async (text: string, txId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTxId(txId);
      setTimeout(() => setCopiedTxId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleExportData = () => {
    const csvRows = [
      ["Tx Hash", "Product", "Action", "From", "To", "Block", "Status", "Timestamp"].join(","),
      ...transactions.map((tx) =>
        [
          tx.txHash ?? "",
          tx.productCode ?? "",
          tx.action,
          tx.fromUserName ?? "",
          tx.toUserName ?? "",
          tx.blockNumber ?? "",
          tx.status,
          formatDate(tx.createdAt),
        ].join(",")
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "txHash",
      header: "Transaction",
      cell: ({ row }) => {
        const tx = row.original;
        return (
          <div className="flex items-center gap-2">
            {tx.txHash && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(tx.txHash!, String(tx.id));
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {copiedTxId === String(tx.id)
                          ? "Copied!"
                          : "Copy Tx Hash"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-mono text-sm text-primary">
                  {formatTxHash(tx.txHash)}
                </span>
              </>
            )}
            {!tx.txHash && (
              <span className="text-sm text-muted-foreground">N/A</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "productCode",
      header: "Product",
      cell: ({ row }) => {
        const tx = row.original;
        return (
          <div>
            <div className="text-sm font-medium">
              {tx.productCode ?? "N/A"}
            </div>
            {tx.productName && (
              <div className="text-xs text-muted-foreground">
                {tx.productName}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.action}</span>
      ),
    },
    {
      id: "transfer",
      header: "Transfer",
      cell: ({ row }) => {
        const tx = row.original;
        return (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground truncate max-w-[100px]">
              {tx.fromUserName ?? "N/A"}
            </span>
            <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground truncate max-w-[100px]">
              {tx.toUserName ?? "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "blockNumber",
      header: "Block",
      cell: ({ row }) => (
        <span className="text-sm font-mono">
          {row.original.blockNumber?.toLocaleString() ?? "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const statusConfig = getStatusConfig(row.original.status);
        const Icon = statusConfig.icon;
        return (
          <Badge
            variant={statusConfig.variant}
            className="flex items-center gap-1 w-fit"
          >
            <Icon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const tx = row.original;
        if (!tx.txHash) return null;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <ViewTransactionButton txHash={tx.txHash} />
              </TooltipTrigger>
              <TooltipContent>
                <p>View Details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
  ];

  return (
    <div className="flex-1 p-6 bg-background text-foreground space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-2">
            Blockchain transaction records showing every movement and
            verification of products
          </p>
        </div>
        <Button onClick={handleExportData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : transactions.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? "..." : transactions.filter((tx) => tx.status === "Confirmed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {loading ? "..." : transactions.filter((tx) => tx.status === "Pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loading ? "..." : transactions.filter((tx) => tx.status === "Failed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions, products, batches..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="whitespace-nowrap">
              <Filter className="h-4 w-4 mr-2" />
              Status: {statusFilter === "all" ? "All" : statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              All Status
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setStatusFilter("Confirmed")}>
              Confirmed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("Pending")}>
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("Failed")}>
              Failed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transaction
            {filteredTransactions.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading transactions...
            </div>
          ) : (
            <DataTable columns={columns} data={filteredTransactions} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
