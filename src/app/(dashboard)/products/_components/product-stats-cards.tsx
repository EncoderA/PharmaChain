"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Product } from "./types";

interface ProductStatsCardsProps {
  products: Product[];
  loading: boolean;
}

export function ProductStatsCards({ products, loading }: ProductStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : products.length}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Verified</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {loading ? "..." : products.filter((p) => p.status === "Verified").length}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {loading ? "..." : products.filter((p) => p.status === "Pending").length}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {loading ? "..." : products.filter((p) => p.stock < 50).length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
