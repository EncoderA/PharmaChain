import { Factory, Truck, Store, Building2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { BackButton } from "@/components/products/back-button";
import { CopyButton } from "@/components/products/copy-button";
import { ViewTransactionButton } from "@/components/products/view-transaction-button";

const ProductDetailPage = async ({
  params,
}: {
  params: Promise<{ productId: string }>;
}) => {
  const { productId } = await params;

  // Mock product data - In real app, fetch from API/database
  const product = {
    id: productId,
    name: "Paracetamol 500mg",
    manufacturer: "PharmaChain Labs",
    batch: "BATCH-A123",
    stock: 120,
    status: "Verified",
    timestamp: "2025-10-25 10:45 AM",
    hash: "0x9f2a86d4c8b3e1a7f5d2e8c4b7a9e3d1f6c8a2b4",
    expiryDate: "2026-10-25",
    category: "Analgesic",
    description: "Pain reliever and fever reducer",
    dosage: "500mg tablets",
  };

  // Supply chain timeline - In real app, fetch from blockchain
  const timeline = [
    {
      id: 1,
      stage: "Manufactured",
      entity: "PharmaChain Labs",
      location: "Mumbai, India",
      timestamp: "2025-10-20 09:00 AM",
      status: "completed" as const,
      icon: Factory,
      txHash: "0x9f2a86d4c8b3e1a7f5d2e8c4b7a9e3d1f6c8a2b4",
      details: "Product manufactured and quality tested",
    },
    {
      id: 2,
      stage: "Distributor",
      entity: "MediDistribute Inc",
      location: "Delhi, India",
      timestamp: "2025-10-22 02:30 PM",
      status: "completed" as const,
      icon: Truck,
      txHash: "0x8a3d7f2e1c9b6a4d8e5f3a2b1c7d9e4f6a8b3c1",
      details: "Received at distribution center",
    },
    {
      id: 3,
      stage: "Wholesaler",
      entity: "PharmaBulk Solutions",
      location: "Bangalore, India",
      timestamp: "2025-10-24 11:15 AM",
      status: "completed" as const,
      icon: Building2,
      txHash: "0x7b4c9e2a8d6f1c3a5b9e7d2f4a8c6b3e1d5f9a2",
      details: "Transferred to wholesaler storage",
    },
    {
      id: 4,
      stage: "Pharmacy/Retailer",
      entity: "HealthCare Pharmacy",
      location: "Pune, India",
      timestamp: "2025-10-25 10:45 AM",
      status: "current" as const,
      icon: Store,
      txHash: "0x6c3a8d2f9e1b7a4c6d8f2e5a9b3c7e1d4f8a2b6",
      details: "Available for purchase",
    },
    {
      id: 5,
      stage: "End User",
      entity: "Customer",
      location: "Pending",
      timestamp: "Pending",
      status: "pending" as const,
      icon: User,
      txHash: "---",
      details: "Awaiting purchase",
    },
  ];

  return (
    <div className="flex-1 p-6 bg-background space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <BackButton />
      </div>

      {/* Product Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{product.name}</CardTitle>
              <CardDescription className="mt-2">
                Product ID: {product.id} • Batch: {product.batch}
              </CardDescription>
            </div>
            <Badge className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {product.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Manufacturer
              </label>
              <p className="text-sm mt-1">{product.manufacturer}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Category
              </label>
              <p className="text-sm mt-1">{product.category}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Stock Available
              </label>
              <p className="text-sm mt-1">{product.stock} units</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Dosage
              </label>
              <p className="text-sm mt-1">{product.dosage}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Expiry Date
              </label>
              <p className="text-sm mt-1">{product.expiryDate}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Last Updated
              </label>
              <p className="text-sm mt-1">{product.timestamp}</p>
            </div>
          </div>
          <div className="mt-6">
            <label className="text-sm font-medium text-muted-foreground">
              Blockchain Hash
            </label>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm font-mono bg-muted p-2 rounded flex-1 break-all">
                {product.hash}
              </p>
              <CopyButton text={product.hash} id="main" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supply Chain Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Supply Chain Timeline</CardTitle>
          <CardDescription>
            Track the journey of this product through the supply chain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {timeline.map((event, index) => {
              const Icon = event.icon;
              const isLast = index === timeline.length - 1;
              const isCompleted = event.status === "completed";
              const isCurrent = event.status === "current";

              return (
                <div key={event.id} className="flex gap-4 pb-8 relative">
                  {/* Icon */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? "bg-primary text-forground"
                          : isCurrent
                          ? "bg-blue-500/20 text-forground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    )}

                    {/* Timeline Line - moved inside icon container */}
                    {!isLast && (
                      <div className="absolute left-1/2 top-12 w-0.5 h-[calc(100%+2rem)] -translate-x-1/2 border-l-2 border-dashed border-border" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="bg-card border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-base">
                            {event.stage}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {event.entity}
                          </p>
                        </div>
                        <Badge
                          variant={
                            isCompleted
                              ? "default"
                              : isCurrent
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {event.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {event.details}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Location:
                          </span>
                          <span className="ml-2 font-medium">
                            {event.location}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Timestamp:
                          </span>
                          <span className="ml-2 font-medium">
                            {event.timestamp}
                          </span>
                        </div>
                      </div>
                      {event.txHash !== "---" && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Transaction Hash:
                            </span>
                            <code className="text-xs font-mono bg-muted px-2 py-1 rounded flex-1 truncate">
                              {event.txHash}
                            </code>
                            <CopyButton text={event.txHash} id={event.txHash} />
                            <ViewTransactionButton txHash={event.txHash} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetailPage;
