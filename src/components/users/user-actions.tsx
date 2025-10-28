"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle, XCircle, Trash2 } from "lucide-react";

interface UserActionsProps {
  userId: string;
  status: string;
}

export function UserActions({ userId, status }: UserActionsProps) {
  const handleApprove = () => {
    console.log("Approving user:", userId);
  };

  const handleReject = () => {
    console.log("Rejecting user:", userId);
  };

  const handleDelete = () => {
    console.log("Deleting user:", userId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {status === "Pending" && (
          <>
            <DropdownMenuItem onClick={handleApprove}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleReject}>
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
