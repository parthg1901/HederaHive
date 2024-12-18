import { LogDescription } from "@ethersproject/abi";
import { AccountId, ContractId, NftId, Status, TokenId, TokenNftInfo, TransactionId, TransactionReceipt, TransactionRecord } from "@hashgraph/sdk";

export interface WalletInterface {
  executeContractFunction: (contractId: ContractId, functionParameters: Buffer, gasLimit: number, value: number) => Promise<TransactionRecord>;
  disconnect: () => void;
  getEventsFromRecord: (record: TransactionRecord) => Promise<LogDescription[]>
  createNFT: (name: string, symbol: string, supply: number) => Promise<TokenId | null>;
  mintNFTs: (tokenId: TokenId, CIDs: Buffer[]) => Promise<TransactionReceipt>;
  getNFTInfo: (NFTId: NftId) => Promise<TokenNftInfo[]>;
  createHCSTopic: () => Promise<string | null>;
  subscribeHCSTopic: (topicId: string, onReceive: (message: string) => Promise<void>) => Promise<void>;
  sendMessage: (topicId: string, message: string) => Promise<Status>;
  transferHBAR: (toAddress: AccountId, amount: number) => Promise<TransactionId | string | null>;
  transferFungibleToken: (toAddress: AccountId, tokenId: TokenId, amount: number) => Promise<TransactionId | string | null>;
  transferNonFungibleToken: (toAddress: AccountId, tokenId: TokenId, serialNumber: number) => Promise<TransactionId | string | null>;
  associateToken: (tokenId: TokenId) => Promise<TransactionId | string | null>;
}