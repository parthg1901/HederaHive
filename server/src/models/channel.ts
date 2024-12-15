import mongoose from 'mongoose';

const Schema = mongoose.Schema;

interface IChannel {
  participants: string[];
  closer: string;
  hbarDeposits: { [key: string]: number };
  tokenDeposits: { [tokenAddress: string]: { [participantAddress: string]: number } };
  nftDeposits: { [tokenAddress: string]: { [participantAddress: string]: number[] } };
  totalParticipants: number;
  lastFinalized: number;
}

const channelSchema = new Schema<IChannel>({
  participants: {
    type: [String],
    required: true,
    validate: {
      validator: (v: string[]) => v.length >= 2,
      message: 'A channel must have at least 2 participants'
    }
  },
  closer: {
    type: String,
    required: true
  },
  hbarDeposits: {
    type: Map,
    of: Number,
    default: {}
  },
  tokenDeposits: {
    type: Map,
    of: {
      type: Map,
      of: Number
    },
    default: {}
  },
  nftDeposits: {
    type: Map,
    of: {
      type: Map,
      of: [Number]
    },
    default: {}
  },
  totalParticipants: {
    type: Number,
    required: true,
    default: 0
  },
  lastFinalized: {
    type: Number,
    required: true
  }
});

export default mongoose.model<IChannel>('Channel', channelSchema);
