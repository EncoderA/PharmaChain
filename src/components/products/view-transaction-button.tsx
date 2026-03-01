"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface ViewTransactionButtonProps {
  txHash: string;
}

export function ViewTransactionButton({ txHash }: ViewTransactionButtonProps) {
  const router = useRouter();

  const handleViewTransaction = () => {
    router.push(`/transactions/${encodeURIComponent(txHash)}`);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0 cursor-pointer"
      onClick={handleViewTransaction}
    >
      <ExternalLink className="h-3 w-3" />
    </Button>
  );
}
