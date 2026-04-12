import { CheckCircle, AlertCircle, Store } from "lucide-react";

export interface Product {
  id: number;
  productCode: string;
  name: string;
  category: string | null;
  batch: string | null;
  stock: number;
  status: "Verified" | "Pending" | "Expired" | "Rejected" | "Sold";
  manufacturerId: number | null;
  currentOwnerId: number | null;
  onChainDrugId: number | null;
  manufacturingDate: string | null;
  expiryDate: string | null;
  blockchainHash: string | null;
  createdAt: string;
  updatedAt: string;
  manufacturerName: string | null;
}

export interface Participant {
  address: string;
  name: string;
  id: number;
}

export const STATUS_CONFIG: Record<
  Product["status"],
  { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle; className?: string }
> = {
  Verified: { variant: "default", icon: CheckCircle },
  Pending: { variant: "secondary", icon: AlertCircle },
  Expired: { variant: "destructive", icon: AlertCircle },
  Rejected: { variant: "destructive", icon: AlertCircle },
  Sold: { variant: "outline", icon: Store, className: "bg-green-50 text-green-700 border-green-200" },
};

export function getStockStatus(stock: number) {
  if (stock === 0) return { label: "Out of Stock", className: "text-red-600" };
  if (stock < 50) return { label: "Low Stock", className: "text-orange-600" };
  return { label: "In Stock", className: "text-green-600" };
}

export function formatDate(dateStr: string | null) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Extracts a user-friendly error message from unknown errors.
 * Handles MetaMask rejections, API errors, and generic Error objects.
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message;
    if (msg.includes("user rejected") || msg.includes("ACTION_REJECTED")) {
      return "MetaMask transaction was rejected.";
    }
    // Handle common contract revert reasons
    if (msg.includes("execution reverted")) {
      const match = msg.match(/reason="([^"]+)"/);
      return match ? `Contract error: ${match[1]}` : "Transaction reverted by the smart contract.";
    }
    // Handle network errors
    if (msg.includes("network") || msg.includes("NETWORK_ERROR")) {
      return "Network error. Please check your connection and try again.";
    }
    // Handle timeout
    if (msg.includes("timeout") || msg.includes("TIMEOUT")) {
      return "Request timed out. Please try again.";
    }
    return msg;
  }
  return "An unknown error occurred. Please try again.";
}

/**
 * Safely parses a JSON response body. Returns the parsed body or a default error message.
 */
export async function parseApiError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.error || data.message || `Request failed with status ${res.status}`;
  } catch {
    return `Request failed with status ${res.status}`;
  }
}
