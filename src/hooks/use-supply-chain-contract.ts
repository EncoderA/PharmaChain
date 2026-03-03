import { useCallback, useState } from "react";
import { getSupplyChainContract } from "@/blockchain/contract";

/** Mirrors the on-chain Stage enum (DrugStruct.sol) */
export enum Stage {
  Manufactured = 0,
  Distributed = 1,
  Wholesaled = 2,
  Sold = 3,
}

/** TypeScript representation of the Drug struct returned by the contract */
export interface DrugStruct {
  drugId: bigint;
  manufacturer: string;
  currentOwner: string;
  manufacturingDate: bigint;
  expiryDate: bigint;
  stage: Stage;
  isRejected: boolean;
  name: string;
  qrHash: string;
}

/** Result returned by on-chain write operations that callers may want to record */
export interface TxResult {
  txHash: string;
  blockNumber: number;
}

export function useSupplyChainContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ================================================================
  // Admin Functions
  // ================================================================

  /** Add a new admin (onlyAdmin) */
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

  /** Remove an admin (onlyAdmin, cannot remove self) */
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

  // ================================================================
  // Manufacturer Functions
  // ================================================================

  /** Add a manufacturer (onlyAdmin) */
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

  /** Remove a manufacturer (onlyAdmin) */
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

  /** Manufacturer self-registration — called by the manufacturer's own wallet */
  const registerAsManufacturer = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const tx = await contract.registerAsManufacturer();
      await tx.wait();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ================================================================
  // Distributor Functions
  // ================================================================

  /** Add a distributor under the calling manufacturer (onlyManufacturer) */
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

  /** Remove a distributor registered under the calling manufacturer (onlyManufacturer) */
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

  // ================================================================
  // Wholesaler Functions
  // ================================================================

  /** Add a wholesaler under the calling manufacturer (onlyManufacturer) */
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

  /** Remove a wholesaler registered under the calling manufacturer (onlyManufacturer) */
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

  // ================================================================
  // Drug Registration & Transfer Functions
  // ================================================================

  /**
   * Register a new drug on-chain (onlyManufacturer).
   * QR hash is auto-generated by the contract.
   * @param name — drug name
   * @param manufacturingDate — unix timestamp (seconds)
   * @param expiryDate — unix timestamp (seconds), must be > manufacturingDate
   */
  const registerDrug = useCallback(
    async (name: string, manufacturingDate: number, expiryDate: number): Promise<TxResult> => {
      setIsLoading(true);
      setError(null);
      try {
        const contract = await getSupplyChainContract();
        const tx = await contract.registerDrug(name, manufacturingDate, expiryDate);
        const receipt = await tx.wait();
        return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Transfer a drug from manufacturer to distributor (onlyManufacturer).
   * Drug must be at Manufactured stage, not expired, not rejected.
   */
  const transferToDistributor = useCallback(
    async (drugId: number, distributorAddress: string): Promise<TxResult> => {
      setIsLoading(true);
      setError(null);
      try {
        const contract = await getSupplyChainContract();
        const tx = await contract.transferToDistributor(drugId, distributorAddress);
        const receipt = await tx.wait();
        return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Transfer a drug from distributor to wholesaler (onlyDistributor).
   * Drug must be at Distributed stage, not expired, not rejected.
   */
  const transferToWholesaler = useCallback(
    async (drugId: number, wholesalerAddress: string): Promise<TxResult> => {
      setIsLoading(true);
      setError(null);
      try {
        const contract = await getSupplyChainContract();
        const tx = await contract.transferToWholesaler(drugId, wholesalerAddress);
        const receipt = await tx.wait();
        return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Mark a drug as sold to the end customer (onlyWholesaler).
   * Drug must be at Wholesaled stage, not expired, not rejected.
   * Sets currentOwner to address(0).
   */
  const markAsSold = useCallback(async (drugId: number): Promise<TxResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const tx = await contract.markAsSold(drugId);
      const receipt = await tx.wait();
      return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reject a drug — callable by any registered participant (admin, manufacturer, distributor, wholesaler).
   * Marks the drug as rejected, preventing further transfers.
   */
  const rejectDrug = useCallback(async (drugId: number): Promise<TxResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const tx = await contract.rejectDrug(drugId);
      const receipt = await tx.wait();
      return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ================================================================
  // Drug View / Verification Functions
  // ================================================================

  /** Get the total number of drugs registered on-chain */
  const getDrugCounter = useCallback(async (): Promise<bigint> => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const count: bigint = await contract.drugCounter();
      return count;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Get full drug details by ID (returns the Drug struct) */
  const getDrugDetails = useCallback(async (drugId: number): Promise<DrugStruct> => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const result = await contract.getDrugDetails(drugId);
      return {
        drugId: result.drugId,
        manufacturer: result.manufacturer,
        currentOwner: result.currentOwner,
        manufacturingDate: result.manufacturingDate,
        expiryDate: result.expiryDate,
        stage: Number(result.stage) as Stage,
        isRejected: result.isRejected,
        name: result.name,
        qrHash: result.qrHash,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Get the full ownership history (array of addresses) for a drug */
  const getDrugJourney = useCallback(async (drugId: number): Promise<string[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const journey: string[] = await contract.getDrugJourney(drugId);
      return journey;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verify a drug by its QR hash (public view).
   * Returns authenticity, expiry status, rejection status, current stage, and current owner.
   */
  const verifyDrugByQR = useCallback(
    async (drugId: number, scannedHash: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const contract = await getSupplyChainContract();
        const result = await contract.verifyDrugByQR(drugId, scannedHash);
        return {
          isAuthentic: result[0] as boolean,
          isExpired: result[1] as boolean,
          isRejected: result[2] as boolean,
          stage: Number(result[3]) as Stage,
          currentOwner: result[4] as string,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ================================================================
  // Hierarchy / Participant View Functions
  // ================================================================

  /** Admin: remove any participant by wallet address */
  const removeParticipant = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const tx = await contract.removeParticipant(address);
      await tx.wait();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Get distributors registered under the calling manufacturer (onlyManufacturer) */
  const getMyDistributors = useCallback(async (): Promise<string[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const list: string[] = await contract.getMyDistributors();
      return list;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Get wholesalers registered under the calling manufacturer (onlyManufacturer) */
  const getMyWholesalers = useCallback(async (): Promise<string[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const list: string[] = await contract.getMyWholesalers();
      return list;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Admin: get all participants across the entire supply chain */
  const getAllParticipants = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getSupplyChainContract();
      const result = await contract.getAllParticipants();
      return {
        admins: result[0] as string[],
        manufacturers: result[1] as string[],
        distributors: result[2] as string[],
        wholesalers: result[3] as string[],
      };
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

    // Manufacturer
    addManufacturer,
    removeManufacturer,
    registerAsManufacturer,

    // Distributor
    addDistributor,
    removeDistributor,

    // Wholesaler
    addWholesaler,
    removeWholesaler,

    // Drug Registration & Transfers
    registerDrug,
    transferToDistributor,
    transferToWholesaler,
    markAsSold,
    rejectDrug,

    // Drug Views & Verification
    getDrugCounter,
    getDrugDetails,
    getDrugJourney,
    verifyDrugByQR,

    // Hierarchy / Participants
    removeParticipant,
    getMyDistributors,
    getMyWholesalers,
    getAllParticipants,
  };
}
