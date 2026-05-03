import mongoose, { Schema, Document, models, model, Types } from 'mongoose';

// ---------- Response sub-document ----------
export interface IResponse {
  questionId: Types.ObjectId;
  selectedOptionIndex: number; // index into Question.options array
  score: number;               // score of the selected option (captured at submit time)
}

const ResponseSchema = new Schema<IResponse>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedOptionIndex: { type: Number, required: true, min: 0 },
    score: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

// ---------- PaymentStatus ENUM ----------
export type PaymentStatus = 'PENDING' | 'PAID';

// ---------- Submission document ----------
export interface ISubmission extends Document {
  testId: Types.ObjectId;
  responses: IResponse[];
  totalScore: number;
  resultText: string;    // matched from scoringRules
  resultStatus: string;  // matched from scoringRules (e.g. "GOOD", "BAD")
  paymentStatus: PaymentStatus;
  paymentId?: string;
  errorLog?: string;
  shortId: string;
  phoneNumber?: string;
  isVerified: boolean;
  verifySessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    testId: {
      type: Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
      index: true,
    },
    responses: { type: [ResponseSchema], default: [] },
    totalScore: { type: Number, required: true, default: 0 },
    resultText: { type: String, default: '' },
    resultStatus: { type: String, default: '' },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID'],
      default: 'PENDING',
    },
    paymentId: { type: String, default: null },
    errorLog: { type: String, default: '' },
    shortId: { type: String, required: true, unique: true },
    phoneNumber: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    verifySessionId: { type: String, default: null },
  },
  { timestamps: true }
);

export const Submission =
  models.Submission || model<ISubmission>('Submission', SubmissionSchema);
