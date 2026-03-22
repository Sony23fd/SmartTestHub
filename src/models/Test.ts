import mongoose, { Schema, Document, models, model } from 'mongoose';

// ---------- ScoringRule sub-document ----------
export interface IScoringRule {
  min: number;
  max: number;
  resultText: string;
  status: string; // e.g. "GOOD", "BAD", "AVERAGE"
}

const ScoringRuleSchema = new Schema<IScoringRule>(
  {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    resultText: { type: String, required: true },
    status: { type: String, required: true },
  },
  { _id: false }
);

// ---------- Test document ----------
export interface ITest extends Document {
  title: string;
  slug: string;
  price: number;
  order: number;
  description?: string;
  scoringRules: IScoringRule[];
  createdAt: Date;
  updatedAt: Date;
}

const TestSchema = new Schema<ITest>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    price: { type: Number, required: true, min: 0 },
    order: { type: Number, default: 0 },
    description: { type: String, default: '' },
    scoringRules: { type: [ScoringRuleSchema], default: [] },
  },
  { timestamps: true }
);

// Prevent model re-registration during Next.js hot reload
export const Test = models.Test || model<ITest>('Test', TestSchema);
