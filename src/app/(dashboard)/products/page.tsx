"use client";

import { useState } from "react";
import { Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ProductStatsCards,
  ProductSearchFilter,
  ProductTable,
  ProductDetailsDialog,
  AddProductDialog,
  TransferDistributorDialog,
  TransferWholesalerDialog,
  TransferPharmacistDialog,
  SellConsumerDialog,
} from "./_components";
import type { Product } from "./_components";
import { useProducts } from "./_hooks/use-products";

export default function ProductsPage() {
  // ─── Core product state & actions from custom hook ────────────────
  const {
    products,
    loading,
    fetchError,
    searchTerm,
    statusFilter,
    user,
    setSearchTerm,
    setStatusFilter,
    addProduct,
    loadDistributors,
    transferProductToDistributor,
    loadWholesalers,
    transferProductToWholesaler,
    loadPharmacists,
    transferProductToPharmacist,
    sellToConsumer,
    exportProducts,
  } = useProducts();

  // ─── Local UI state for dialogs ───────────────────────────────────
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Transfer dialogs
  const [transferDistOpen, setTransferDistOpen] = useState(false);
  const [transferDistProduct, setTransferDistProduct] = useState<Product | null>(null);

  const [transferWholOpen, setTransferWholOpen] = useState(false);
  const [transferWholProduct, setTransferWholProduct] = useState<Product | null>(null);

  const [transferPharmOpen, setTransferPharmOpen] = useState(false);
  const [transferPharmProduct, setTransferPharmProduct] = useState<Product | null>(null);

  const [sellOpen, setSellOpen] = useState(false);
  const [sellProduct, setSellProduct] = useState<Product | null>(null);

  const canAddProducts = user?.role === "manufacturer" || user?.role === "admin";

  // ─── Dialog open handlers ─────────────────────────────────────────
  const openTransferDistributor = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setTransferDistProduct(product);
    setTransferDistOpen(true);
  };

  const openTransferWholesaler = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setTransferWholProduct(product);
    setTransferWholOpen(true);
  };

  const openTransferPharmacist = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setTransferPharmProduct(product);
    setTransferPharmOpen(true);
  };

  const openSellConsumer = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setSellProduct(product);
    setSellOpen(true);
  };

  return (
    <div className="flex-1 p-6 bg-background text-foreground space-y-6">
      {/* ─── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-2">
            Manage and verify all pharmaceutical products registered on the
            blockchain
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportProducts}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {canAddProducts && <AddProductDialog onAdd={addProduct} existingProducts={products} />}
        </div>
      </div>

      {/* ─── Fetch Error Banner ──────────────────────────────────── */}
      {fetchError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load products: {fetchError}
          </AlertDescription>
        </Alert>
      )}

      {/* ─── Stats Cards ─────────────────────────────────────────── */}
      <ProductStatsCards products={products} loading={loading} />

      {/* ─── Search & Filter ─────────────────────────────────────── */}
      <ProductSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* ─── Products Table ──────────────────────────────────────── */}
      <ProductTable
        products={products}
        loading={loading}
        user={user}
        onViewDetails={setSelectedProduct}
        onTransferDistributor={openTransferDistributor}
        onTransferWholesaler={openTransferWholesaler}
        onTransferPharmacist={openTransferPharmacist}
        onSellConsumer={openSellConsumer}
      />

      {/* ─── Dialogs ─────────────────────────────────────────────── */}
      <ProductDetailsDialog
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <TransferDistributorDialog
        product={transferDistProduct}
        open={transferDistOpen}
        onOpenChange={setTransferDistOpen}
        onLoadDistributors={loadDistributors}
        onTransfer={transferProductToDistributor}
      />

      <TransferWholesalerDialog
        product={transferWholProduct}
        open={transferWholOpen}
        onOpenChange={setTransferWholOpen}
        onLoadWholesalers={loadWholesalers}
        onTransfer={transferProductToWholesaler}
      />

      <TransferPharmacistDialog
        product={transferPharmProduct}
        open={transferPharmOpen}
        onOpenChange={setTransferPharmOpen}
        onLoadPharmacists={loadPharmacists}
        onTransfer={transferProductToPharmacist}
      />

      <SellConsumerDialog
        product={sellProduct}
        open={sellOpen}
        onOpenChange={setSellOpen}
        onSell={sellToConsumer}
      />
    </div>
  );
}
