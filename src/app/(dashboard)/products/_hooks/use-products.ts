"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/contexts/user-context";
import { useSupplyChainContract } from "@/hooks/use-supply-chain-contract";
import type { Product, Participant } from "../_components/types";
import { getErrorMessage, parseApiError } from "../_components/types";

export function useProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { user } = useUser();
  const {
    registerDrug,
    getDrugCounter,
    getDrugDetails,
    transferToDistributor,
    transferToWholesaler,
    getMyDistributors,
  } = useSupplyChainContract();

  // ─── Fetch products ───────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchTerm) params.set("search", searchTerm);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) {
        const msg = await parseApiError(res);
        throw new Error(msg);
      }
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setFetchError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchProducts]);

  // ─── Add product ──────────────────────────────────────────────────
  const addProduct = useCallback(
    async (formData: FormData): Promise<void> => {
      const name = formData.get("name") as string;
      const productCode = formData.get("productCode") as string;
      const batch = formData.get("batch") as string;
      const category = formData.get("category") as string;
      const stock = parseInt(formData.get("stock") as string) || 0;
      const expiryDateStr = formData.get("expiryDate") as string;
      const manufacturingDateStr = formData.get("manufacturingDate") as string;

      // Safety-net validation (dialog already validates all of these)
      if (!name || !productCode || !batch || !category || !manufacturingDateStr || !expiryDateStr) {
        throw new Error("All fields are required.");
      }

      const mfgTimestamp = Math.floor(new Date(manufacturingDateStr).getTime() / 1000);
      const expTimestamp = Math.floor(new Date(expiryDateStr).getTime() / 1000);

      if (isNaN(mfgTimestamp) || isNaN(expTimestamp)) {
        throw new Error("Invalid date values provided.");
      }

      if (expTimestamp <= mfgTimestamp) {
        throw new Error("Expiry date must be after manufacturing date.");
      }

      // Step 1: Register on-chain via MetaMask
      const { txHash, blockNumber } = await registerDrug(name, mfgTimestamp, expTimestamp);

      // Step 2: Get the on-chain drug ID
      const drugId = await getDrugCounter();

      // Step 2.5: Get the generated qrHash
      const drugDetails = await getDrugDetails(Number(drugId));
      const qrHash = drugDetails.qrHash;

      // Step 3: Save to database
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          productCode,
          batch: batch || undefined,
          category: category || undefined,
          stock,
          manufacturingDate: manufacturingDateStr || new Date().toISOString(),
          expiryDate: expiryDateStr || undefined,
          blockchainHash: qrHash,
          status: "Verified",
          onChainDrugId: Number(drugId),
        }),
      });

      if (!res.ok) {
        const msg = await parseApiError(res);
        throw new Error(msg);
      }

      const product = await res.json();

      // Step 4: Record the transaction
      const txRes = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          action: "Manufactured",
          fromUserId: user?.id,
          txHash,
          blockNumber,
          status: "Confirmed",
        }),
      });

      if (!txRes.ok) {
        console.error("Failed to record manufacture transaction, but product was created.");
      }

      await fetchProducts();
    },
    [registerDrug, getDrugCounter, getDrugDetails, user, fetchProducts]
  );

  // ─── Transfer to Distributor ──────────────────────────────────────
  const loadDistributors = useCallback(async (): Promise<Participant[]> => {
    const addresses = await getMyDistributors();

    const res = await fetch("/api/user");
    if (!res.ok) {
      throw new Error("Failed to load user list for distributor matching.");
    }

    const dbUsers: { id: number; fullName: string; walletId: string; role: string; status: string }[] =
      await res.json();

    return addresses.map((addr) => {
      const dbUser = dbUsers.find(
        (u) => u.walletId.toLowerCase() === addr.toLowerCase() && u.status === "active"
      );
      return {
        address: addr,
        name: dbUser?.fullName ?? `${addr.slice(0, 6)}...${addr.slice(-4)}`,
        id: dbUser?.id ?? 0,
      };
    });
  }, [getMyDistributors]);

  const transferProductToDistributor = useCallback(
    async (product: Product, distributorAddress: string, distributors: Participant[]): Promise<void> => {
      const distributor = distributors.find((d) => d.address === distributorAddress);
      if (!distributor) throw new Error("Select a distributor.");

      if (!product.blockchainHash) {
        throw new Error("This product was not registered on-chain. Cannot transfer.");
      }

      let onChainDrugId: number | null = product.onChainDrugId ?? null;

      if (onChainDrugId === null) {
        const { getSupplyChainContract } = await import("@/blockchain/contract");
        const contract = await getSupplyChainContract();
        const counter = await contract.drugCounter();

        for (let i = Number(counter); i >= 1; i--) {
          const drug = await contract.getDrugDetails(i);
          if (drug.name === product.name && Number(drug.stage) === 0 && !drug.isRejected) {
            onChainDrugId = i;
            break;
          }
        }
      }

      if (onChainDrugId === null) {
        throw new Error("Could not find this drug on-chain in Manufactured stage.");
      }

      // Step 1: Transfer on-chain
      const { txHash, blockNumber } = await transferToDistributor(onChainDrugId, distributor.address);

      // Step 2: Update product in DB
      const putRes = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentOwnerId: distributor.id || undefined,
          status: "Verified",
        }),
      });

      if (!putRes.ok) {
        console.error("On-chain transfer succeeded but DB update failed. Manual DB fix may be needed.");
      }

      // Step 3: Record transaction
      const txRes = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          action: "Distributed",
          fromUserId: user?.id,
          toUserId: distributor.id || undefined,
          txHash,
          blockNumber,
          status: "Confirmed",
        }),
      });

      if (!txRes.ok) {
        console.error("Failed to record distribution transaction.");
      }

      await fetchProducts();
    },
    [transferToDistributor, user, fetchProducts]
  );

  // ─── Transfer to Wholesaler ───────────────────────────────────────
  const loadWholesalers = useCallback(async (product: Product): Promise<Participant[]> => {
    const res = await fetch("/api/user");
    if (!res.ok) {
      throw new Error("Failed to load user list for wholesaler matching.");
    }

    const dbUsers: { id: number; fullName: string; walletId: string; role: string; status: string }[] =
      await res.json();

    let wholesalerList = dbUsers.filter(
      (u) => (u.role === "wholesaler" || u.role === "pharmacist") && u.status === "active" && u.walletId
    );

    const mfrId = product.manufacturerId;
    if (mfrId) {
      const scoped = wholesalerList.filter((u) => u.id !== mfrId);
      if (scoped.length > 0) wholesalerList = scoped;
    }

    return wholesalerList.map((u) => ({
      address: u.walletId,
      name: u.fullName,
      id: u.id,
    }));
  }, []);

  const transferProductToWholesaler = useCallback(
    async (product: Product, wholesalerAddress: string, wholesalers: Participant[]): Promise<void> => {
      const wholesaler = wholesalers.find((w) => w.address === wholesalerAddress);
      if (!wholesaler) throw new Error("Select a wholesaler.");

      if (!product.blockchainHash) {
        throw new Error("This product was not registered on-chain. Cannot transfer.");
      }

      let onChainDrugId: number | null = product.onChainDrugId ?? null;

      if (onChainDrugId === null) {
        const { getSupplyChainContract } = await import("@/blockchain/contract");
        const contract = await getSupplyChainContract();
        const counter = await contract.drugCounter();

        for (let i = Number(counter); i >= 1; i--) {
          const drug = await contract.getDrugDetails(i);
          if (drug.name === product.name && Number(drug.stage) === 1 && !drug.isRejected) {
            onChainDrugId = i;
            break;
          }
        }
      }

      if (onChainDrugId === null) {
        throw new Error("Could not find this drug on-chain in Distributed stage.");
      }

      const { txHash, blockNumber } = await transferToWholesaler(onChainDrugId, wholesaler.address);

      const putRes = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentOwnerId: wholesaler.id || undefined,
          status: "Verified",
        }),
      });

      if (!putRes.ok) {
        console.error("On-chain transfer succeeded but DB update failed. Manual DB fix may be needed.");
      }

      const txRes = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          action: "Wholesaled",
          fromUserId: user?.id,
          toUserId: wholesaler.id || undefined,
          txHash,
          blockNumber,
          status: "Confirmed",
        }),
      });

      if (!txRes.ok) {
        console.error("Failed to record wholesaler transaction.");
      }

      await fetchProducts();
    },
    [transferToWholesaler, user, fetchProducts]
  );

  // ─── Transfer to Pharmacist (off-chain) ───────────────────────────
  const loadPharmacists = useCallback(async (): Promise<Participant[]> => {
    const res = await fetch("/api/user");
    if (!res.ok) {
      throw new Error("Failed to load user list for pharmacist matching.");
    }

    const dbUsers: { id: number; fullName: string; walletId: string; role: string; status: string }[] =
      await res.json();

    return dbUsers
      .filter((u) => u.role === "pharmacist" && u.status === "active")
      .map((u) => ({
        address: u.walletId,
        name: u.fullName,
        id: u.id,
      }));
  }, []);

  const transferProductToPharmacist = useCallback(
    async (product: Product, pharmacistId: string, pharmacists: Participant[]): Promise<void> => {
      const pharmacist = pharmacists.find((p) => String(p.id) === pharmacistId);
      if (!pharmacist) throw new Error("Select a pharmacist.");

      const putRes = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentOwnerId: pharmacist.id,
          status: "Verified",
        }),
      });

      if (!putRes.ok) {
        const msg = await parseApiError(putRes);
        throw new Error(msg);
      }

      const txRes = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          action: "Transferred to Pharmacist",
          fromUserId: user?.id,
          toUserId: pharmacist.id,
          status: "Confirmed",
        }),
      });

      if (!txRes.ok) {
        console.error("Failed to record pharmacist transfer transaction.");
      }

      await fetchProducts();
    },
    [user, fetchProducts]
  );

  // ─── Sell to Consumer ─────────────────────────────────────────────
  const sellToConsumer = useCallback(
    async (product: Product, formData: FormData): Promise<void> => {
      const consumerName = formData.get("consumerName") as string;
      const consumerPhone = formData.get("consumerPhone") as string;
      const consumerAddress = formData.get("consumerAddress") as string;
      const quantity = parseInt(formData.get("quantity") as string) || 1;

      if (!consumerName) {
        throw new Error("Consumer name is required.");
      }

      if (quantity > product.stock) {
        throw new Error("Quantity exceeds available stock.");
      }

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          consumerName,
          consumerPhone: consumerPhone || undefined,
          consumerAddress: consumerAddress || undefined,
          quantity,
          txHash: null,
          blockNumber: null,
          status: "Confirmed",
        }),
      });

      if (!res.ok) {
        const msg = await parseApiError(res);
        throw new Error(msg);
      }

      await fetchProducts();
    },
    [fetchProducts]
  );

  // ─── Export ────────────────────────────────────────────────────────
  const exportProducts = useCallback(() => {
    if (products.length === 0) return;

    const csvRows = [
      ["Product Code", "Name", "Manufacturer", "Batch", "Stock", "Status", "Category", "Expiry Date"].join(","),
      ...products.map((p) =>
        [
          p.productCode,
          p.name,
          p.manufacturerName ?? "",
          p.batch ?? "",
          p.stock,
          p.status,
          p.category ?? "",
          p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : "",
        ].join(",")
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [products]);

  return {
    // State
    products,
    loading,
    fetchError,
    searchTerm,
    statusFilter,
    user,

    // Setters
    setSearchTerm,
    setStatusFilter,

    // Actions
    fetchProducts,
    addProduct,
    loadDistributors,
    transferProductToDistributor,
    loadWholesalers,
    transferProductToWholesaler,
    loadPharmacists,
    transferProductToPharmacist,
    sellToConsumer,
    exportProducts,
  };
}
