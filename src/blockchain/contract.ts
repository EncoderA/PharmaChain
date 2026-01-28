import { BrowserProvider, Contract, Eip1193Provider } from "ethers";
import SupplyChainABI from "./contracts/SupplyChain.json";
import { SUPPLYCHAIN_ADDRESS } from "./addresses";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export async function getSupplyChainContract() {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  // Request wallet connection
  await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new Contract(
    SUPPLYCHAIN_ADDRESS,
    SupplyChainABI,
    signer
  );
}
