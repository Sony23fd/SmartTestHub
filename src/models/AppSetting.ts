import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IAppSetting extends Document {
  qpayEnabled: boolean;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
}

const AppSettingSchema = new Schema<IAppSetting>({
  qpayEnabled: { type: Boolean, default: true },
  bankAccountName: { type: String, default: "" },
  bankAccountNumber: { type: String, default: "" },
  bankName: { type: String, default: "" },
}, { timestamps: true });

export const AppSetting = models.AppSetting || model<IAppSetting>('AppSetting', AppSettingSchema);
