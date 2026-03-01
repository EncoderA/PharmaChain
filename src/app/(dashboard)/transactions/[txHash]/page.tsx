"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BackButton } from "@/components/products/back-button";
import { CopyButton } from "@/components/products/copy-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  AlertCircle,
  FileText,
  Zap,
  Link as LinkIcon,
} from "lucide-react";

interface TransactionDetail {
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
  productBatch?: string | null;
  fromUserName: string | null;
  fromUserOrg?: string | null;
  toUserName: string | null;
  toUserOrg?: string | null;
}

export default function TransactionExplorerPage() {
  const params = useParams();
  const txHash = decodeURIComponent(params.txHash as string);

  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [relatedTransactions, setRelatedTransactions] = useState<TransactionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // If the param is numeric, try fetching by ID directly
        const isNumeric = /^\d+$/.test(txHash);

        let txData: TransactionDetail | null = null;

        if (isNumeric) {
          const res = await fetch(`/api/transactions/${txHash}`);
          if (res.ok) {
            txData = await res.json();
          }
        }

        // If not numeric or ID lookup failed, search through list
        if (!txData) {
          const listRes = await fetch("/api/transactions");
          if (listRes.ok) {
            const allTx: TransactionDetail[] = await listRes.json();
            txData = allTx.find((t) => t.txHash === txHash) || null;
          }
        }

        if (!txData) {
          throw new Error("Transaction not found");
        }

        setTransaction(txData);

        // Fetch related transactions for the same product
        if (txData.productId) {
          const relRes = await fetch(`/api/transactions?productId=${txData.productId}`);
          if (relRes.ok) {
            const relData: TransactionDetail[] = await relRes.json();
            setRelatedTransactions(relData.filter((t) => t.id !== txData!.id));
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [txHash]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === "Confirmed") {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          {status}
        </Badge>
      );
    }
    if (status === "Failed") {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {status}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 bg-background">
        <div className="flex items-center gap-4 mb-6">
          <BackButton />
        </div>
        <div className="text-center py-12 text-muted-foreground">
          Loading transaction details...
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="flex-1 p-6 bg-background">
        <div className="flex items-center gap-4 mb-6">
          <BackButton />
        </div>
        <div className="text-center py-12 text-destructive">
          {error || "Transaction not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-background space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <BackButton />
      </div>

      {/* Transaction Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Transaction Details</CardTitle>
              <CardDescription className="mt-2">
                Transaction record from PharmaChain database
              </CardDescription>
            </div>
            {getStatusBadge(transaction.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Transaction Hash */}
          {transaction.txHash && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Transaction Hash
              </label>
              <div className="flex items-center gap-2 mt-2">
                <code className="text-sm font-mono bg-muted p-3 rounded flex-1 break-all">
                  {transaction.txHash}
                </code>
                <CopyButton text={transaction.txHash} id="txHash" />
              </div>
            </div>
          )}

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {transaction.blockNumber && (
              <div className="bg-card border rounded-lg p-4">
                <label className="text-xs font-medium text-muted-foreground uppercase">
                  Block Number
                </label>
                <p className="text-lg font-mono font-semibold mt-2">
                  {transaction.blockNumber.toLocaleString()}
                </p>
              </div>
            )}
            <div className="bg-card border rounded-lg p-4">
              <label className="text-xs font-medium text-muted-foreground uppercase">
                Timestamp
              </label>
              <p className="text-sm font-semibold mt-2">
                {formatDate(transaction.createdAt)}
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <label className="text-xs font-medium text-muted-foreground uppercase">
                Action
              </label>
              <p className="text-lg font-semibold mt-2">
                {transaction.action}
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <label className="text-xs font-medium text-muted-foreground uppercase">
                Transaction ID
              </label>
              <p className="text-lg font-mono font-semibold mt-2">
                #{transaction.id}
              </p>
            </div>
          </div>

          {/* From & To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                From
              </label>
              <div className="mt-2 bg-muted p-3 rounded">
                <p className="text-sm font-semibold">{transaction.fromUserName ?? "N/A"}</p>
                {transaction.fromUserOrg && (
                  <p className="text-xs text-muted-foreground">{transaction.fromUserOrg}</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                To
              </label>
              <div className="mt-2 bg-muted p-3 rounded">
                <p className="text-sm font-semibold">{transaction.toUserName ?? "N/A"}</p>
                {transaction.toUserOrg && (
                  <p className="text-xs text-muted-foreground">{transaction.toUserOrg}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Information */}
      {transaction.productId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <label className="text-xs font-medium text-muted-foreground uppercase">
                  Product Code
                </label>
                <p className="text-sm font-semibold mt-2">{transaction.productCode ?? "N/A"}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <label className="text-xs font-medium text-muted-foreground uppercase">
                  Product Name
                </label>
                <p className="text-sm font-semibold mt-2">{transaction.productName ?? "N/A"}</p>
              </div>
              {transaction.productBatch && (
                <div className="bg-muted p-4 rounded-lg">
                  <label className="text-xs font-medium text-muted-foreground uppercase">
                    Batch
                  </label>
                  <p className="text-sm font-semibold mt-2">{transaction.productBatch}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Transactions */}
      {relatedTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Related Transactions
            </CardTitle>
            <CardDescription>
              Other transactions for the same product
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {relatedTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{tx.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.fromUserName ?? "N/A"} → {tx.toUserName ?? "N/A"}
                    </p>
                    {tx.txHash && (
                      <code className="text-xs font-mono text-muted-foreground truncate block mt-1">
                        {tx.txHash}
                      </code>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {tx.blockNumber && <p>Block #{tx.blockNumber}</p>}
                    <p className="text-xs">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
