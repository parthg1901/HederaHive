"use client";
import { WalletConnectContext } from "../../../context/WalletConnectProvider";
import { useCallback, useContext, useEffect } from 'react';
import { WalletInterface } from "../walletInterface";
import { AccountId, ContractExecuteTransaction, ContractId, LedgerId, TokenAssociateTransaction, TokenId, Transaction, TransactionId, TransferTransaction, Client, TokenCreateTransaction, TokenType, TokenSupplyType, PrivateKey, TokenMintTransaction, AccountBalanceQuery } from "@hashgraph/sdk";
import { ContractFunctionParameterBuilder } from "../contractFunctionParameterBuilder";
import { appConfig } from "../../../config";
import { SignClientTypes } from "@walletconnect/types";
import { DAppConnector, HederaJsonRpcMethod, HederaSessionEvent, HederaChainId, SignAndExecuteTransactionParams, transactionToBase64String } from "@hashgraph/hedera-wallet-connect";
import EventEmitter from "events";

// Created refreshEvent because `dappConnector.walletConnectClient.on(eventName, syncWithWalletConnectContext)` would not call syncWithWalletConnectContext
// Reference usage from walletconnect implementation https://github.com/hashgraph/hedera-wallet-connect/blob/main/src/lib/dapp/index.ts#L120C1-L124C9
const refreshEvent = new EventEmitter();

// Create a new project in walletconnect cloud to generate a project id
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";
const currentNetworkConfig = appConfig.networks.testnet;
const hederaNetwork = currentNetworkConfig.network;
const hederaClient = Client.forName(hederaNetwork);

// Adapted from walletconnect dapp example:
// https://github.com/hashgraph/hedera-wallet-connect/blob/main/src/examples/typescript/dapp/main.ts#L87C1-L101C4
const metadata: SignClientTypes.Metadata = {
  name: "HederaHive",
  description: "HederaHive",
  url: "http://localhost:3000",
  icons: ["http://localhost:3000" + "/logo192.png"],
}
const dappConnector = new DAppConnector(
  metadata,
  LedgerId.fromString(hederaNetwork),
  walletConnectProjectId,
  Object.values(HederaJsonRpcMethod),
  [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
  [HederaChainId.Testnet],
);

// ensure walletconnect is initialized only once
let walletConnectInitPromise: Promise<void> | undefined = undefined;
const initializeWalletConnect = async () => {
  if (walletConnectInitPromise === undefined) {
    walletConnectInitPromise = dappConnector.init();
  }
  await walletConnectInitPromise;
};

export const openWalletConnectModal = async () => {
  await initializeWalletConnect();
  await dappConnector.openModal().then((x) => {
    refreshEvent.emit("sync");
  });
};

class WalletConnectWallet implements WalletInterface {
  private getSigner() {
    if (dappConnector.signers.length === 0) {
      throw new Error('No signers found!');
    }
    return dappConnector.signers[0];
  }

  private getAccountId() {
    // Need to convert from walletconnect's AccountId to hashgraph/sdk's AccountId because walletconnect's AccountId and hashgraph/sdk's AccountId are not the same!
    return AccountId.fromString(this.getSigner().getAccountId().toString());
  }
  async bCheckerFcn(id: AccountId, tokenID: TokenId) {
		const balanceCheckTx = await new AccountBalanceQuery().setAccountId(id).executeWithSigner(this.getSigner());
		return [balanceCheckTx.tokens && balanceCheckTx.tokens._map.get(tokenID.toString()), balanceCheckTx.hbars];
	}
  async createNFT(name: string, symbol: string, supply: number) {
    const supplyKEY = PrivateKey.fromStringDer(process.env.NEXT_PUBLIC_SUPPLY_KEY!);
    let nftCreateTx = await new TokenCreateTransaction()
    .setTokenName(name)
    .setTokenSymbol(symbol)
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(supply)
    .setTreasuryAccountId(this.getAccountId())
    .setSupplyKey(supplyKEY)
    .setAdminKey(supplyKEY)
    .setKycKey(supplyKEY)
    .freezeWithSigner(this.getSigner());
    console.log(nftCreateTx)
    try {
      const nftCreateTxSigned = await nftCreateTx.signWithSigner(this.getSigner());
      const nftCreateTxSignedByAdmin = await nftCreateTxSigned.sign(supplyKEY);

      console.log(nftCreateTxSigned)
      const nftCreateTxResponse = await nftCreateTxSignedByAdmin.executeWithSigner(this.getSigner());
  
      // Get receipt for create token transaction
      const nftCreateTxReceipt = await nftCreateTxResponse.getReceiptWithSigner(this.getSigner());
      console.log(
        `Status of NFT create transaction: ${nftCreateTxReceipt.status.toString()}`
      );
  
      // Get token id
      const tokenId = nftCreateTxReceipt.tokenId;
      console.log(`Token id: ${tokenId!.toString()}`);
      return tokenId;

    } catch (error) {
      console.log("error")
      return null;
    }
  }

  async mintNFTs(tokenId: TokenId, CIDs: Buffer[]) {
    const supplyKEY = PrivateKey.fromStringDer(process.env.NEXT_PUBLIC_SUPPLY_KEY!);

    let mintTx = await new TokenMintTransaction().setTokenId(tokenId).setMetadata(CIDs).freezeWithSigner(this.getSigner());
		let mintTxSign = await mintTx.sign(supplyKEY);
		let mintTxSubmit = await mintTxSign.executeWithSigner(this.getSigner());
		let mintRx = await mintTxSubmit.getReceiptWithSigner(this.getSigner());
    const oB = await this.bCheckerFcn(this.getAccountId(), tokenId);
    console.log(`\n- Treasury balance: ${oB[0]} NFTs of ID: ${tokenId.toString()} and ${oB[1]}`);
		console.log([mintRx, mintTxSubmit.transactionId]);
    return mintRx;
  }

  async transferHBAR(toAddress: AccountId, amount: number) {
    const transferHBARTransaction = new TransferTransaction()
      .addHbarTransfer(this.getAccountId(), -amount)
      .addHbarTransfer(toAddress, amount);

    const signer = this.getSigner();
    await transferHBARTransaction.freezeWithSigner(signer);
    const txResult = await transferHBARTransaction.executeWithSigner(signer);
    return txResult ? txResult.transactionId : null;
  }

  async transferFungibleToken(toAddress: AccountId, tokenId: TokenId, amount: number) {
    const transferTokenTransaction = new TransferTransaction()
      .addTokenTransfer(tokenId, this.getAccountId(), -amount)
      .addTokenTransfer(tokenId, toAddress.toString(), amount);

    const signer = this.getSigner();
    await transferTokenTransaction.freezeWithSigner(signer);
    const txResult = await transferTokenTransaction.executeWithSigner(signer);
    return txResult ? txResult.transactionId : null;
  }

  async transferNonFungibleToken(toAddress: AccountId, tokenId: TokenId, serialNumber: number) {
    const transferTokenTransaction = new TransferTransaction()
      .addNftTransfer(tokenId, serialNumber, this.getAccountId(), toAddress);

    const signer = this.getSigner();
    await transferTokenTransaction.freezeWithSigner(signer);
    const txResult = await transferTokenTransaction.executeWithSigner(signer);
    return txResult ? txResult.transactionId : null;
  }

  async associateToken(tokenId: TokenId) {
    const associateTokenTransaction = new TokenAssociateTransaction()
      .setAccountId(this.getAccountId())
      .setTokenIds([tokenId]);

    const signer = this.getSigner();
    await associateTokenTransaction.freezeWithSigner(signer);
    const txResult = await associateTokenTransaction.executeWithSigner(signer);
    return txResult ? txResult.transactionId : null;
  }

  // Purpose: build contract execute transaction and send to wallet for signing and execution
  // Returns: Promise<TransactionId | null>
  async executeContractFunction(contractId: ContractId, functionName: string, functionParameters: ContractFunctionParameterBuilder, gasLimit: number) {
    const tx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(gasLimit)
      .setFunction(functionName, functionParameters.buildHAPIParams());

    const signer = this.getSigner();
    await tx.freezeWithSigner(signer);
    const txResult = await tx.executeWithSigner(signer);

    // in order to read the contract call results, you will need to query the contract call's results form a mirror node using the transaction id
    // after getting the contract call results, use ethers and abi.decode to decode the call_result
    return txResult ? txResult.transactionId : null;
  }
  disconnect() {
    dappConnector.disconnectAll().then(() => {
      refreshEvent.emit("sync");
    });
  }
};
export const walletConnectWallet = new WalletConnectWallet();

// this component will sync the walletconnect state with the context
export const WalletConnectClient = () => {
  // use the HashpackContext to keep track of the hashpack account and connection
  const { setAccountId, setIsConnected } = useContext(WalletConnectContext);

  // sync the walletconnect state with the context
  const syncWithWalletConnectContext = useCallback(() => {
    const accountId = dappConnector.signers[0]?.getAccountId()?.toString();
    if (accountId) {
      setAccountId(accountId);
      setIsConnected(true);
    } else {
      setAccountId('');
      setIsConnected(false);
    }
  }, [setAccountId, setIsConnected]);

  useEffect(() => {
    // Sync after walletconnect finishes initializing
    refreshEvent.addListener("sync", syncWithWalletConnectContext);

    initializeWalletConnect().then(() => {
      syncWithWalletConnectContext();
    });

    return () => {
      refreshEvent.removeListener("sync", syncWithWalletConnectContext);
    }
  }, [syncWithWalletConnectContext]);
  return null;
};
