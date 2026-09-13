import mongoose, { Schema, Document, model } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  slug: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  videoFilePath: string;
  previewVideoPath?: string;
  duration: string;
  authorName: string;
  authorTitle?: string;
  validDays: number;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, default: 19000, min: 0 },
    thumbnailUrl: { type: String, default: '' },
    videoFilePath: { type: String, required: true },
    previewVideoPath: { type: String, default: '' },
    duration: { type: String, default: '' },
    authorName: { type: String, default: '' },
    authorTitle: { type: String, default: '' },
    validDays: { type: Number, default: 30 },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

if (mongoose.models.Video) {
  delete mongoose.models.Video;
}

export const Video = model<IVideo>('Video', VideoSchema);
