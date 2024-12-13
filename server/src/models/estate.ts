import mongoose from 'mongoose';

const Schema = mongoose.Schema;

interface IEstate {
  _id: string;
  name: string;
  description: string;
  rental: number;
  location: string;
  estimatedValue: number;
  owner: string;
  token: string;
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
    type: Number,
    required: true
  },
  owner: {
    type: String,
    required: true
  },
  token: {
    type: String,
    unique: true,
    required: true
  }
});

export default mongoose.model<IEstate>('Estate', estateSchema);
