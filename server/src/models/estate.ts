import mongoose from 'mongoose';

const Schema = mongoose.Schema;

interface IEstate {
  _id: string;
  name: string;
  description: string;
  rental: number;
  location: string;
  estimatedValue: number | undefined;
  owner: string;
  token: string;
  holders: {
    address: string;
    share: number;
  }[];
  channel: string;
}

const estateSchema = new Schema<IEstate>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  rental: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  estimatedValue: {
    type: Number
  },
  owner: {
    type: String,
    required: true
  },
  token: {
    type: String,
    unique: true,
    required: true
  },
  holders: {
    type: [
      {
        address: String,
        share: Number
      }
    ],
    default: []
  },
  channel: {
    type: String,
    required: false
  }
});

export default mongoose.model<IEstate>('Estate', estateSchema);
