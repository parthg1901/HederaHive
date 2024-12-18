import mongoose from 'mongoose';

const Schema = mongoose.Schema;

interface IChannel {
  name: string;
  participants: string[];
  closer: string;
  hbarDeposits: { [key: string]: number };
  tokenDeposits: { [key: string]: { [key: string]: number } };
  nftDeposits: { [key: string]: { [key: string]: number[] } };
  totalParticipants: number;
  lastFinalized: number;
  channelId: string;
}

const channelSchema = new Schema<IChannel>({
  name: {
    type: String,
    required: true
  },
  channelId: {
    type: String,
    required: true,
  },
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
    type: Object,
    of: Number,
    default: {}
  },
  tokenDeposits: {
    type: Object,
    of: {
      type: Object,
      of: Number
    },
    default: {}
  },
  nftDeposits: {
    type: Object,
    of: {
      type: Object,
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
