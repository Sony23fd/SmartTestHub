import mongoose, { Schema, Document, model, Types } from 'mongoose';

export interface IVideoOrder extends Document {
  videoId: Types.ObjectId;
  amount: number;
  phoneNumber: string;
  paymentStatus: 'PENDING' | 'PAID';
  isVerified: boolean;
  verifySessionId?: string;
  paymentId?: string;
  shortId: string;
  accessToken?: string;
  paidAt?: Date;
  expiresAt?: Date;
  errorLog?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VideoOrderSchema = new Schema<IVideoOrder>(
  {
    videoId: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, default: 19000 },
    phoneNumber: { type: String, required: true, index: true },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID'],
      default: 'PENDING',
      index: true,
    },
    isVerified: { type: Boolean, default: false, index: true },
    verifySessionId: { type: String, default: null, index: true },
    paymentId: { type: String, default: null, index: true },
    shortId: { type: String, required: true, unique: true },
    accessToken: { type: String, default: null, index: true },
    paidAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    errorLog: { type: String, default: '' },
  },
  { timestamps: true }
);

if (mongoose.models.VideoOrder) {
  delete mongoose.models.VideoOrder;
}

export const VideoOrder = model<IVideoOrder>('VideoOrder', VideoOrderSchema);
