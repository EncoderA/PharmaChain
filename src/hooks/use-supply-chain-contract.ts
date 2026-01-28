import { useCallback, useState } from "react";
import { getSupplyChainContract } from "@/blockchain/contract";

export function useSupplyChainContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Admin Functions
  const addAdmin = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const tx = await contract.addAdmin(address);
      await tx.wait();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeAdmin = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const tx = await contract.removeAdmin(address);
      await tx.wait();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAdmins = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const adminsList = await contract.getAdmins();
      return adminsList;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Manufacturer Functions
  const addManufacturer = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const tx = await contract.addManufacturer(address);
      await tx.wait();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeManufacturer = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const tx = await contract.removeManufacturer(address);
      await tx.wait();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getManufacturers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const manufacturersList = await contract.getManufacturers();
      return manufacturersList;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Distributor Functions
  const addDistributor = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const tx = await contract.addDistributor(address);
      await tx.wait();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeDistributor = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const tx = await contract.removeDistributor(address);
      await tx.wait();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDistributors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const distributorsList = await contract.getDistributors();
      return distributorsList;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Wholesaler Functions
  const addWholesaler = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const tx = await contract.addWholesaler(address);
      await tx.wait();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeWholesaler = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const tx = await contract.removeWholesaler(address);
      await tx.wait();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getWholesalers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const wholesalersList = await contract.getWholesalers();
      return wholesalersList;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    setError,
    // Admin
    addAdmin,
    removeAdmin,
    getAdmins,
    // Manufacturer
    addManufacturer,
    removeManufacturer,
    getManufacturers,
    // Distributor
    addDistributor,
    removeDistributor,
    getDistributors,
    // Wholesaler
    addWholesaler,
    removeWholesaler,
    getWholesalers,
  };
}
