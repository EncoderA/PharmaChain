"use client";

import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface ProductSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function ProductSearchFilter({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: ProductSearchFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products, manufacturers, batches..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
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
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onStatusFilterChange("all")}>
            All Status
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusFilterChange("Verified")}>
            Verified
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusFilterChange("Pending")}>
            Pending
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusFilterChange("Expired")}>
            Expired
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
