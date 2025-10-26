"use client";

import React, { useState } from "react";
import { Search, Filter, Download, Eye, Copy, CheckCircle, Clock, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Transaction {
  txId: string;
  productId: string;
  batch: string;
  action: string;
  from: string;
  to: string;
  timestamp: string;
  status: "Confirmed" | "Pending" | "Failed";
  block: number;
  gasUsed: number;
  value: string;
}

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  const transactions: Transaction[] = [
    {
      txId: "0x9a4d8f3c7b2e1a6d9f8c7b6a5e4d3f2c1b8a7e6d5f4c3b2a1f7b2",
      productId: "PRD-001",
      batch: "BATCH-A123",
      action: "Manufactured",
      from: "PharmaChain Labs",
      to: "Distributor Hub",
      timestamp: "2025-10-24 10:42 AM",
      status: "Confirmed",
      block: 108942,
      gasUsed: 21000,
      value: "0 ETH",
    },
    {
      txId: "0x7f2c9e8d1b6a3c4f5e8d7c6b9a2f1e4d3c8b7a6e5f4d3c2b1a9b61",
      productId: "PRD-001",
      batch: "BATCH-A123",
      action: "Quality Verified",
      from: "Distributor Hub",
      to: "HealthMart Pharmacy",
      timestamp: "2025-10-25 02:16 PM",
      status: "Confirmed",
      block: 108977,
      gasUsed: 35000,
      value: "0 ETH",
    },
    {
      txId: "0x1e8a7d9c6b5a4f3e2d1c8b9a7e6d5f4c3b2a1e8d7c6b5a4f3e2d1ac42",
      productId: "PRD-002",
      batch: "BATCH-B298",
      action: "Shipment Received",
      from: "HealthMart Pharmacy",
      to: "End Consumer",
      timestamp: "2025-10-26 09:05 AM",
      status: "Pending",
      block: 109005,
      gasUsed: 28000,
      value: "0 ETH",
    },
    {
      txId: "0x3d2c1b8a9e7f6d5c4b3a2e1d8c7b6a5f4e3d2c1b8a9e7f6d5c4b3a2e1d",
      productId: "PRD-003",
      batch: "BATCH-C456",
      action: "Batch Created",
      from: "PharmaChain Labs",
      to: "Quality Control",
      timestamp: "2025-10-27 11:20 AM",
      status: "Failed",
      block: 109042,
      gasUsed: 0,
      value: "0 ETH",
    },
  ];

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.txId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: Transaction["status"]) => {
    const config = {
      Confirmed: { variant: "default" as const, icon: CheckCircle, label: "Confirmed" },
      Pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
      Failed: { variant: "destructive" as const, icon: Clock, label: "Failed" },
    };
    return config[status];
  };

  const copyToClipboard = async (text: string, txId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTxId(txId);
      setTimeout(() => setCopiedTxId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  const handleExportData = () => {
    // In a real app, this would generate a CSV file
    console.log("Exporting transactions data...");
  };

  return (
    <div className="flex-1 p-6 bg-background text-foreground space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-2">
            Blockchain transaction records showing every movement and verification of products
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
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {transactions.filter(tx => tx.status === "Confirmed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {transactions.filter(tx => tx.status === "Pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Latest Block</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.max(...transactions.map(tx => tx.block))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
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
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Transaction
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Transfer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Block
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => {
                  const statusConfig = getStatusConfig(tx.status);
                  const Icon = statusConfig.icon;
                  
                  return (
                    <tr key={tx.txId} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-muted"
                                  onClick={() => copyToClipboard(tx.txId, tx.txId)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{copiedTxId === tx.txId ? "Copied!" : "Copy Tx Hash"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <span className="font-mono text-sm text-primary">
                            {formatTxHash(tx.txId)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium">{tx.productId}</div>
                          <div className="text-xs text-muted-foreground">{tx.batch}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{tx.action}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground truncate max-w-[100px]">
                            {tx.from}
                          </span>
                          <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground truncate max-w-[100px]">
                            {tx.to}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{tx.block.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{tx.timestamp}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusConfig.variant} className="flex items-center gap-1 w-fit">
                          <Icon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedTx(tx)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Transaction Details</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTx(null)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Transaction Hash</label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-mono break-all">{selectedTx.txId}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(selectedTx.txId, selectedTx.txId)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    {(() => {
                      const statusConfig = getStatusConfig(selectedTx.status);
                      const Icon = statusConfig.icon;
                      return (
                        <Badge variant={statusConfig.variant} className="flex items-center gap-1 w-fit">
                          <Icon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Product ID</label>
                  <p className="text-sm mt-1">{selectedTx.productId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Batch</label>
                  <p className="text-sm mt-1">{selectedTx.batch}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">From</label>
                  <p className="text-sm mt-1">{selectedTx.from}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">To</label>
                  <p className="text-sm mt-1">{selectedTx.to}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Block Number</label>
                  <p className="text-sm font-mono mt-1">{selectedTx.block.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Gas Used</label>
                  <p className="text-sm mt-1">{selectedTx.gasUsed.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Action</label>
                  <p className="text-sm mt-1">{selectedTx.action}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Value</label>
                  <p className="text-sm mt-1">{selectedTx.value}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                <p className="text-sm mt-1">{selectedTx.timestamp}</p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedTx(null)}>
                  Close
                </Button>
                <Button>View on Explorer</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}