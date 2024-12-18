"use client";
import { WalletConnectContext } from "../../../context/WalletConnectProvider";
import { useCallback, useContext, useEffect } from "react";
import { WalletInterface } from "../walletInterface";
import {
  AccountId,
  ContractExecuteTransaction,
  ContractId,
  LedgerId,
  TokenAssociateTransaction,
  TokenId,
  TransferTransaction,
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  PrivateKey,
  TokenMintTransaction,
  AccountBalanceQuery,
  NftId,
  TokenNftInfoQuery,
  TransactionRecord,
  TopicCreateTransaction,
  TopicMessageQuery,
  TopicMessageSubmitTransaction,
  Status
} from "@hashgraph/sdk";
import { appConfig } from "../../../config";
import { SignClientTypes } from "@walletconnect/types";
import {
  DAppConnector,
  HederaJsonRpcMethod,
  HederaSessionEvent,
  HederaChainId,
} from "@hashgraph/hedera-wallet-connect";
import EventEmitter from "events";
import { Interface } from "@ethersproject/abi";

// Created refreshEvent because `dappConnector.walletConnectClient.on(eventName, syncWithWalletConnectContext)` would not call syncWithWalletConnectContext
// Reference usage from walletconnect implementation https://github.com/hashgraph/hedera-wallet-connect/blob/main/src/lib/dapp/index.ts#L120C1-L124C9
const refreshEvent = new EventEmitter();

// Create a new project in walletconnect cloud to generate a project id
const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";
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
};
const dappConnector = new DAppConnector(
  metadata,
  LedgerId.fromString(hederaNetwork),
  walletConnectProjectId,
  Object.values(HederaJsonRpcMethod),
  [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
  [HederaChainId.Testnet]
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
      throw new Error("No signers found!");
    }
    return dappConnector.signers[0];
  }

  private getAccountId() {
    // Need to convert from walletconnect's AccountId to hashgraph/sdk's AccountId because walletconnect's AccountId and hashgraph/sdk's AccountId are not the same!
    return AccountId.fromString(this.getSigner().getAccountId().toString());
  }
  async bCheckerFcn(id: AccountId, tokenID: TokenId) {
    const balanceCheckTx = await new AccountBalanceQuery()
      .setAccountId(id)
      .executeWithSigner(this.getSigner());
    return [
      balanceCheckTx.tokens &&
        balanceCheckTx.tokens._map.get(tokenID.toString()),
      balanceCheckTx.hbars,
    ];
  }
  async createNFT(name: string, symbol: string, supply: number) {
    const supplyKEY = PrivateKey.fromStringDer(
      process.env.NEXT_PUBLIC_SUPPLY_KEY!
    );
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
    console.log(nftCreateTx);
    try {
      const nftCreateTxSigned = await nftCreateTx.signWithSigner(
        this.getSigner()
      );
      const nftCreateTxSignedByAdmin = await nftCreateTxSigned.sign(supplyKEY);

      console.log(nftCreateTxSigned);
      const nftCreateTxResponse =
        await nftCreateTxSignedByAdmin.executeWithSigner(this.getSigner());

      // Get receipt for create token transaction
      const nftCreateTxReceipt = await nftCreateTxResponse.getReceiptWithSigner(
        this.getSigner()
      );
      console.log(
        `Status of NFT create transaction: ${nftCreateTxReceipt.status.toString()}`
      );

      // Get token id
      const tokenId = nftCreateTxReceipt.tokenId;
      console.log(`Token id: ${tokenId!.toString()}`);
      return tokenId;
    } catch (error) {
      console.log("error");
      return null;
    }
  }

  async getNFTInfo(NFTId: NftId) {
    const supplyKEY = PrivateKey.fromStringDer(
      process.env.NEXT_PUBLIC_SUPPLY_KEY!
    );

    const client = Client.forTestnet().setOperator(
      process.env.NEXT_PUBLIC_SUPPLY_KEY_ID!,
      supplyKEY
    );
    try {
      const nftInfos = await new TokenNftInfoQuery()
        .setNftId(NFTId)
        .execute(client);
      return nftInfos;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async mintNFTs(tokenId: TokenId, CIDs: Buffer[]) {
    const supplyKEY = PrivateKey.fromStringDer(
      process.env.NEXT_PUBLIC_SUPPLY_KEY!
    );

    let mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata(CIDs)
      .freezeWithSigner(this.getSigner());
    let mintTxSign = await mintTx.sign(supplyKEY);
    let mintTxSubmit = await mintTxSign.executeWithSigner(this.getSigner());
    let mintRx = await mintTxSubmit.getReceiptWithSigner(this.getSigner());
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

  async createHCSTopic() {
    const supplyKEY = PrivateKey.fromStringDer(
      process.env.NEXT_PUBLIC_SUPPLY_KEY!
    );

    const client = Client.forTestnet().setOperator(
      process.env.NEXT_PUBLIC_SUPPLY_KEY_ID!,
      supplyKEY
    );
    // Create a new topic
    const createTopicTransaction =
      await new TopicCreateTransaction().execute(client);
    let receipt = await createTopicTransaction.getReceipt(
      client
    );
    let topicId = receipt.topicId;
    if (topicId) {
      return topicId.toString();
    } else {
      throw new Error("Failed to create topic");
    }
  }

  async subscribeHCSTopic(topicId: string, onReceive: (message: string) => Promise<void>) {
    console.log("Subscribing to topic: " + topicId);
    const supplyKEY = PrivateKey.fromStringDer(
      process.env.NEXT_PUBLIC_SUPPLY_KEY!
    );

    const client = Client.forTestnet().setOperator(
      process.env.NEXT_PUBLIC_SUPPLY_KEY_ID!,
      supplyKEY
    );
    new TopicMessageQuery()
    .setTopicId(topicId)
    .subscribe(client, null, async (message) => {
      let messageAsString = Buffer.from(message.contents).toString('utf8');

      console.log(
        `${message.consensusTimestamp.toDate()} Received: ${messageAsString}`
      );
      await onReceive(messageAsString);
    });
  }

  async sendMessage(topicId: string, message: string) {

    let sendResponse = await new TopicMessageSubmitTransaction({
      topicId: topicId,
      message,
    }).executeWithSigner(this.getSigner());
    const getReceipt = await sendResponse.getReceiptWithSigner(this.getSigner());
  
    // Get the status of the transaction
    const transactionStatus = getReceipt.status;
    console.log("The message transaction status: " + transactionStatus.toString())
    if (transactionStatus === Status.Success) {
      return transactionStatus;
    } else {
      throw new Error("Failed to send message");
    }
  }

  async transferFungibleToken(
    toAddress: AccountId,
    tokenId: TokenId,
    amount: number
  ) {
    const transferTokenTransaction = new TransferTransaction()
      .addTokenTransfer(tokenId, this.getAccountId(), -amount)
      .addTokenTransfer(tokenId, toAddress.toString(), amount);

    const signer = this.getSigner();
    await transferTokenTransaction.freezeWithSigner(signer);
    const txResult = await transferTokenTransaction.executeWithSigner(signer);
    return txResult ? txResult.transactionId : null;
  }

  async transferNonFungibleToken(
    toAddress: AccountId,
    tokenId: TokenId,
    serialNumber: number
  ) {
    const transferTokenTransaction = new TransferTransaction().addNftTransfer(
      tokenId,
      serialNumber,
      this.getAccountId(),
      toAddress
    );

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
  async executeContractFunction(
    contractId: ContractId,
    functionParameters: Buffer,
    gasLimit: number,
    value: number
  ) {
    const tx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(gasLimit)
      .setFunctionParameters(functionParameters);
    if (value > 0) {
      tx.setPayableAmount(value);
    }
    const signer = this.getSigner();
    await tx.freezeWithSigner(signer);
    const txResult = await tx.executeWithSigner(signer);
    const record = await txResult.getRecordWithSigner(signer);

    // in order to read the contract call results, you will need to query the contract call's results form a mirror node using the transaction id
    // after getting the contract call results, use ethers and abi.decode to decode the call_result
    return record;
  }

  async getEventsFromRecord(record: TransactionRecord) {
    const abi = [
      "event ChannelOpened(bytes32 indexed channelId, address[] participants, address closer, uint256[] hbarAmounts, address[] tokens, uint256[][] tokenAmounts, address[] nftTokens, int64[][][] serialNumbers)",
      "event ChannelFinalized(bytes32 indexed channelId, address[] participants, uint256[] hbarBalances, address[] tokens, uint256[][] tokenBalances, address[] nftTokens, int64[][][] nftFinalBalances, uint256 timestamp)",
      "event ParticipantAdded(bytes32 indexed channelId, address indexed newParticipant)",
    ];
    const abiInterface = new Interface(abi);
    const output = record.contractFunctionResult?.logs.map((log) => {
      // convert the log.data (uint8Array) to a string
      let logStringHex = "0x".concat(Buffer.from(log.data).toString("hex"));

      // get topics from log
      let logTopics: string[] = [];
      log.topics.forEach((topic) => {
        logTopics.push("0x".concat(Buffer.from(topic).toString("hex")));
      });

      // decode the event data
      let logRequest: any = {};
      logRequest.data = logStringHex;
      logRequest.topics = logTopics;
      let event = abiInterface.parseLog(logRequest);
      return event;
    });
    return output || [];
  }
  disconnect() {
    dappConnector.disconnectAll().then(() => {
      refreshEvent.emit("sync");
    });
  }
}
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
      setAccountId("");
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
    };
  }, [syncWithWalletConnectContext]);
  return null;
};
