"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eip1193Provider } from "ethers";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

const SEPOLIA_CHAIN_ID = 0xaa36a7;

export default function WalletButton() {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert("MetaMask not installed");
        return;
      }

      setLoading(true);

       //Request wallet connection
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

    //   //Network check (Sepolia only)
    //   const chainId = await window.ethereum.request({
    //     method: "eth_chainId",
    //   });

    //   if (chainId !== SEPOLIA_CHAIN_ID) {
    //     alert("Please switch to Sepolia Testnet");
    //     setLoading(false);
    //     return;
    //   }

      setAccount(accounts[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }



  // Auto-detect already connected wallet
  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.request({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      });
  }, []);

  //Wallet disconnect (UI-only)
  function disconnectWallet() {
    setAccount(null);
  }


//   return (
//     <Button
//       onClick={connectWallet}
//       disabled={loading}
//       variant="default"
//       className="gap-2"
//     >
//       {account
//         ? `${account.slice(0, 6)}...${account.slice(-4)}`
//         : loading
//         ? "Connecting..."
//         : "Connect Wallet"}
//     </Button>
//   );

return (
    <div className="flex items-center gap-2  p-2 rounded-lg shadow-md">
      {account ? (
        <>
          <Button variant="outline" disabled>
            {account.slice(0, 6)}...{account.slice(-4)}
          </Button>

          <Button
            variant="destructive"
            onClick={disconnectWallet}
          >
            Disconnect
          </Button>
        </>
      ) : (
        <Button
          onClick={connectWallet}
          disabled={loading}
        >
          {loading ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}
    </div>
  );
}
