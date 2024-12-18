"udr client";
import { IHive } from "@/app/home/page";
import { useWalletInterface } from "@/services/wallets/useWalletInterface";
import { Interface } from "@ethersproject/abi";
import { AccountId, ContractId, EntityIdHelper } from "@hashgraph/sdk";
import React, { useEffect, useState } from "react";

interface ChatroomProps {
  hive: IHive;
  onClose: () => void;
}

const Chatroom: React.FC<ChatroomProps> = ({ hive, onClose }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const [participants, setParticipants] = useState<string[]>(hive.participants);
  const { walletInterface, accountId } = useWalletInterface();

  // Modal State
  const [isAddParticipantModalOpen, setAddParticipantModalOpen] =
    useState(false);
  const [isTransferModalOpen, setTransferModalOpen] = useState(false);
  const [newParticipant, setNewParticipant] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(
    null
  );

  useEffect(() => {
    (async () => {
      if (walletInterface) {
        walletInterface.subscribeHCSTopic(hive.topicId, async (msg) => {
          console.log(msg);
        });
      }
    })();
  }, [walletInterface]);

  const sendMessage = () => {
    if (input.trim() !== "") {
      setMessages([...messages, input]);
      setInput("");
    }
  };

  const handleAddParticipant = async () => {
    if (newParticipant.trim() !== "") {
      const abi = [
        "function addParticipant(bytes32 channelId, address newParticipant) external",
      ];

      const iface = new Interface(abi);

      const data = iface
        .encodeFunctionData("openChannel", [hive.channelId, newParticipant])
        .slice(2);
      await walletInterface?.executeContractFunction(
        ContractId.fromString("0.0.5268920"),
        Buffer.from(data, "hex"),
        500000,
        0
      );
      await fetch(
        process.env.NEXT_PUBLIC_SERVER! + "/api/v1/channel/participant",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channelId: hive.channelId,
            participant: newParticipant,
          }),
        }
      );
      setParticipants([...participants, newParticipant]);
      setNewParticipant("");
      setAddParticipantModalOpen(false);
    }
  };

  const handleTransfer = async () => {
    if (transferAmount && selectedParticipant && accountId) {
      const accountIdEVM = AccountId.fromString(accountId).toSolidityAddress();
      
      const hbarDeposits = hive.hbarDeposits;
      hbarDeposits[selectedParticipant] += parseInt(transferAmount);
      hbarDeposits[accountIdEVM] -= parseInt(transferAmount);
      await fetch(
        process.env.NEXT_PUBLIC_SERVER! + "/api/v1/channel/state",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channelId: hive.channelId,
            participants,
            hbarBalances: participants.map((participant) => hbarDeposits[participant]),
          }),
        }
      );
      setTransferAmount("");
      setTransferModalOpen(false);
      setSelectedParticipant(null);
    }
  };

  return (
    <div className="flex flex-col h-screen text-white p-4 w-[30vw]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 pb-2 mb-2">
        <h2 className="text-xl font-bold">{hive.name} Chat</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-red-500 transition duration-300"
        >
          Close
        </button>
      </div>

      {/* Participants List */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Participants</h3>
          <button
            onClick={() => setAddParticipantModalOpen(true)}
            className="px-2 py-1 bg-purple-700 hover:bg-purple-600 rounded-md text-sm transition duration-300"
          >
            Add Participant
          </button>
        </div>
        <div className="max-h-32 overflow-y-auto border border-gray-700 rounded-md p-2">
          {participants.length > 0 ? (
            participants.map((participant) => (
              <div
                key={participant}
                className="flex justify-between items-center mb-2 last:mb-0"
              >
                <p className="text-sm">
                  {EntityIdHelper.fromSolidityAddress(participant).join(".")}
                </p>
                <button
                  onClick={() => {
                    setSelectedParticipant(participant);
                    setTransferModalOpen(true);
                  }}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-sm rounded-md transition duration-300"
                >
                  Transfer
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No participants yet.</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 border-t border-b border-gray-700 pt-2">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className="p-2 mb-2 bg-gray-800 rounded-md max-w-fit"
            >
              {msg}
            </div>
          ))
        ) : (
          <p className="text-gray-400">
            No messages yet. Start the conversation!
          </p>
        )}
      </div>

      {/* Input Box */}
      <div className="flex items-center border-t border-gray-700 pt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 bg-gray-800 rounded-md text-white focus:outline-none focus:ring focus:ring-purple-500"
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-md transition duration-300"
        >
          Send
        </button>
      </div>

      {/* Add Participant Modal */}
      {isAddParticipantModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-black p-6 rounded-md w-[20vw]">
            <h3 className="text-lg font-semibold mb-4">Add Participant</h3>
            <input
              type="text"
              placeholder="Enter address(EVM)"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setAddParticipantModalOpen(false)}
                className="px-4 py-2 bg-gray-600 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAddParticipant}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-md"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-black p-6 rounded-md w-[20vw]">
            <h3 className="text-lg font-semibold mb-4">Transfer HBAR</h3>
            <p className="mb-2 text-gray-400">
              Transfer to:{" "}
              {EntityIdHelper.fromSolidityAddress(selectedParticipant!).join(
                "."
              )}
            </p>
            <input
              type="number"
              placeholder="Enter amount"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              className="w-full border rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setTransferModalOpen(false)}
                className="px-4 py-2 bg-gray-600 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatroom;
