import { BackButton } from "@/components/products/back-button";
import { CopyButton } from "@/components/products/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  ExternalLink,
  FileText,
  Zap,
  Link as LinkIcon,
} from "lucide-react";

const TransactionExplorerPage = async ({
  params,
}: {
  params: Promise<{ txHash: string }>;
}) => {
  const { txHash } = await params;

  // Mock transaction data - In real app, fetch from blockchain/API
  const transaction = {
    txHash: txHash,
    blockNumber: 108942,
    timestamp: "2025-10-22 02:30 PM",
    status: "Confirmed",
    gasUsed: 85432,
    gasPrice: "50 Gwei",
    transactionFee: "0.00427 ETH",
    from: "0x742d35Cc6634C0532925a3b844Bc9e7595f123456",
    to: "0x8ba1f109551bD432803012645Ac136ddd64DFFabc",
    value: "0",
    contractAddress: "0x3f5CE5FBFe3E9af3971dD820d23CB0619b6eF234",
    methodName: "trackProduct",
    methodSignature: "trackProduct(string productId, string stage, address entity)",
  };

  const relatedTransactions = [
    {
      id: 1,
      txHash: "0x9f2a86d4c8b3e1a7f5d2e8c4b7a9e3d1f6c8a2b4",
      stage: "Manufactured",
      timestamp: "2025-10-20 09:00 AM",
      blockNumber: 108920,
    },
    {
      id: 2,
      txHash: "0x8a3d7f2e1c9b6a4d8e5f3a2b1c7d9e4f6a8b3c1",
      stage: "Distributor",
      timestamp: "2025-10-22 02:30 PM",
      blockNumber: 108942,
    },
    {
      id: 3,
      txHash: "0x7b4c9e2a8d6f1c3a5b9e7d2f4a8c6b3e1d5f9a2",
      stage: "Wholesaler",
      timestamp: "2025-10-24 11:15 AM",
      blockNumber: 108965,
    },
  ];

  const inputData = {
    productId: "PRD-001",
    stage: "Distributor",
    entity: "0x742d35Cc6634C0532925a3b844Bc9e7595f123456",
  };

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
                Blockchain transaction verification for PharmaChain
              </CardDescription>
            </div>
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {transaction.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Transaction Hash */}
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

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border rounded-lg p-4">
              <label className="text-xs font-medium text-muted-foreground uppercase">
                Block Number
              </label>
              <p className="text-lg font-mono font-semibold mt-2">
                {transaction.blockNumber.toLocaleString()}
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <label className="text-xs font-medium text-muted-foreground uppercase">
                Timestamp
              </label>
              <p className="text-sm font-semibold mt-2">
                {transaction.timestamp}
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <label className="text-xs font-medium text-muted-foreground uppercase">
                Gas Used
              </label>
              <p className="text-lg font-mono font-semibold mt-2">
                {transaction.gasUsed.toLocaleString()}
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <label className="text-xs font-medium text-muted-foreground uppercase">
                Transaction Fee
              </label>
              <p className="text-lg font-mono font-semibold mt-2">
                {transaction.transactionFee}
              </p>
            </div>
          </div>

          {/* From & To Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                From Address
              </label>
              <div className="flex items-center gap-2 mt-2">
                <code className="text-xs font-mono bg-muted p-2 rounded flex-1 truncate">
                  {transaction.from}
                </code>
                <CopyButton text={transaction.from} id="from" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                To Address
              </label>
              <div className="flex items-center gap-2 mt-2">
                <code className="text-xs font-mono bg-muted p-2 rounded flex-1 truncate">
                  {transaction.to}
                </code>
                <CopyButton text={transaction.to} id="to" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Contract Address
            </label>
            <div className="flex items-center gap-2 mt-2">
              <code className="text-xs font-mono bg-muted p-2 rounded flex-1 truncate">
                {transaction.contractAddress}
              </code>
              <CopyButton text={transaction.contractAddress} id="contract" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Method Name
              </label>
              <code className="text-sm font-mono bg-muted p-2 rounded inline-block mt-2">
                {transaction.methodName}()
              </code>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Gas Price
              </label>
              <p className="text-sm font-mono mt-2">{transaction.gasPrice}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Method Signature
            </label>
            <code className="text-xs font-mono bg-muted p-3 rounded block mt-2 break-all">
              {transaction.methodSignature}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Input Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Input Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <label className="text-xs font-medium text-muted-foreground uppercase">
                Product ID
              </label>
              <p className="text-sm font-semibold mt-2">{inputData.productId}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <label className="text-xs font-medium text-muted-foreground uppercase">
                Stage
              </label>
              <p className="text-sm font-semibold mt-2">{inputData.stage}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <label className="text-xs font-medium text-muted-foreground uppercase">
                Entity
              </label>
              <code className="text-xs font-mono mt-2 break-all">
                {inputData.entity}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Related Transactions
          </CardTitle>
          <CardDescription>
            Other transactions for this product
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
                  <p className="text-sm font-semibold">{tx.stage}</p>
                  <code className="text-xs font-mono text-muted-foreground truncate">
                    {tx.txHash}
                  </code>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>Block #{tx.blockNumber}</p>
                  <p className="text-xs">{tx.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* External Links */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          View on Etherscan
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          View on PolygonScan
        </Button>
      </div>
    </div>
  );
};

export default TransactionExplorerPage;
