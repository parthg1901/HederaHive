import React from "react";
import MetamaskLogo from "../public/metamask-logo.svg";
import WalletConnectLogo from "../public/walletconnect-logo.svg";
import { connectToMetamask } from "../services/wallets/metamask/metamaskClient";
import { openWalletConnectModal } from "../services/wallets/walletconnect/walletConnectClient";
import Image from "next/image";

interface WalletSelectionDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  onClose: (value: string) => void;
}

export const WalletSelectionDialog = ({
  open,
  setOpen,
  onClose,
}: WalletSelectionDialogProps) => {
  if (!open) return null;
  const handleOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.id === "modal-overlay") {
      setOpen(false);
      onClose("OutsideClick");
    }
  };

  return (
    <div id="modal-overlay" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 font-[family-name:var(--font-geist-mono)]" onClick={handleOutsideClick}>
      <div className="bg-black border border-white rounded-xl shadow-lg p-6 w-80">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Select a Wallet
        </h2>
        <div className="flex flex-col gap-4">
          <button
            className="flex items-center gap-3 border border-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-all"
            onClick={() => {
              openWalletConnectModal();
              setOpen(false);
              onClose("WalletConnect");
            }}
          >
            <Image
              src={WalletConnectLogo}
              height={6}
              width={6}
              alt="WalletConnect Logo"
              className="w-6 h-6"
            />
            WalletConnect
          </button>
          <button
            className="flex items-center gap-3 border border-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl transition-all"
            onClick={() => {
              connectToMetamask();
              setOpen(false);
              onClose("Metamask");
            }}
          >
            <Image
              src={MetamaskLogo}
              height={6}
              width={6}
              alt="Metamask Logo"
              className="w-6 h-6"
            />
            Metamask
          </button>
        </div>
      </div>
    </div>
  );
};
