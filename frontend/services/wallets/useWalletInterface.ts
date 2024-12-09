import { useContext } from "react"
import { WalletConnectContext } from "../../context/WalletConnectProvider";
import { walletConnectWallet } from "./walletconnect/walletConnectClient";

// Purpose: This hook is used to determine which wallet interface to use
// Example: const { accountId, walletInterface } = useWalletInterface();
// Returns: { accountId: string | null, walletInterface: WalletInterface | null }
export const useWalletInterface = () => {
  const walletConnectCtx = useContext(WalletConnectContext);

  if (walletConnectCtx.accountId) {
    return {
      accountId: walletConnectCtx.accountId,
      walletInterface: walletConnectWallet
    }
  } else {
    return {
      accountId: null,
      walletInterface: null
    };
  }
}