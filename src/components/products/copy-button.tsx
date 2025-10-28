"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useState } from "react";

interface CopyButtonProps {
  text: string;
  id: string;
}

export function CopyButton({ text, id }: CopyButtonProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <Button variant="ghost" size="sm" onClick={copyToClipboard}>
      {copiedHash === id ? "Copied!" : <Copy className="h-4 w-4" />}
    </Button>
  );
}
