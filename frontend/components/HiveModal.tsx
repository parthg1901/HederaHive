import React, { useState } from "react";

interface CreateHiveModalProps {
  onClose: () => void;
  onSubmit: (
    channelName: string,
    participants: string[],
    hbarDeposit: number
  ) => Promise<void>;
}

const CreateHiveModal: React.FC<CreateHiveModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const [channelName, setChannelName] = useState("");
  const [participants, setParticipants] = useState("");
  const [hbarDeposit, setHbarDeposit] = useState<number>(0);

  const handleSubmit = async () => {
    await onSubmit(channelName, participants.split(","), hbarDeposit);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-black p-6 rounded-lg w-96">
        <h2 className="text-white text-xl mb-4 text-center">Create Hive</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Channel Name</label>
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            className="w-full p-2 border rounded-md bg-transparent focus:ring-2 focus:ring-purple-500"
            placeholder="Enter channel name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Participants</label>
          <input
            type="text"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            className="w-full p-2 border rounded-md bg-transparent focus:ring-2 focus:ring-purple-500"
            placeholder="Comma-separated participants(EVM Addresses)"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">HBAR Deposit</label>
          <input
            type="number"
            value={hbarDeposit}
            onChange={(e) => setHbarDeposit(Number(e.target.value))}
            className="w-full p-2 border rounded-md bg-transparent focus:ring-2 focus:ring-purple-500"
            placeholder="Enter HBAR amount"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateHiveModal;
