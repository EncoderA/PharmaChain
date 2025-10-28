"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw } from "lucide-react";
import { useState } from "react";

interface ReferralCardProps {
  referralCode: string;
}

export function ReferralCard({ referralCode }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    console.log("Regenerating referral code...");
  };

  const referralUrl = `https://pharmachain.io/join?ref=${referralCode}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manufacturer Referral Code</CardTitle>
        <CardDescription>
          Share this code with vendors, distributors, and pharmacies to join your network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Referral Code</label>
          <div className="flex gap-2">
            <Input value={referralCode} readOnly className="font-mono" />
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? "✓" : <Copy className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={handleRegenerate}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Referral Link</label>
          <div className="flex gap-2">
            <Input value={referralUrl} readOnly className="text-xs" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(referralUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? "✓" : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Total Referrals:</strong> 24 users joined
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            <strong>Active Users:</strong> 18 approved
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
