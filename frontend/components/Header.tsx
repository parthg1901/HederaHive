"use client";
import Image from "next/image";
import { WalletSelectionDialog } from "./WalletSelectDialog";
import { useWalletInterface } from "@/services/wallets/useWalletInterface";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { accountId, walletInterface } = useWalletInterface();

  const handleConnect = async () => {
    if (accountId && walletInterface) {
      walletInterface.disconnect();
    } else {
      setOpen(true);
    }
  };

  useEffect(() => {
    if (accountId) {
      setOpen(false);
    }
  }, [accountId])
  return (
    <header className="absolute top-0 left-0 w-full p-4 flex items-center justify-between z-[100]">
      <Link href={"/"} className="ml-4">
        <h2 className="text-3xl font-[family-name:var(--font-brolink)]">HederaHive</h2>
      </Link>

      <button
          onClick={handleConnect}
          className="gd-button relative inline-block text-white p-[0.5px] font-medium rounded-xl
          bg-gradient-to-r from-yellow-500 via-purple-300 to-blue-300
          border border-transparent bg-[length:200%_200%] bg-clip-border"
        >
          <span className="block rounded-xl bg-black px-3 py-1 text-medium font-[family-name:var(--font-geist-mono)]">
            {accountId ? `Connected: ${accountId}` : 'Connect Wallet'}
          </span>
        </button>
      <WalletSelectionDialog open={open} setOpen={setOpen} onClose={() => setOpen(false)} />
    </header>
  );
}
