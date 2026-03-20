import mongoose, { Schema, Document, models, model, Types } from 'mongoose';

// ---------- Option sub-document ----------
export interface IOption {
  text: string;
  score: number;
}

const OptionSchema = new Schema<IOption>(
  {
    text: { type: String, required: true },
    score: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

// ---------- Question document ----------
export interface IQuestion extends Document {
  testId: Types.ObjectId;
  text: string;
  order: number;
  options: IOption[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    testId: {
      type: Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
      index: true,
    },
    text: { type: String, required: true, trim: true },
    order: { type: Number, required: true, default: 0 },
    options: { type: [OptionSchema], default: [] },
  },
  { timestamps: true }
);

// Sort questions by order field by default
QuestionSchema.index({ testId: 1, order: 1 });

export const Question =
  models.Question || model<IQuestion>('Question', QuestionSchema);
