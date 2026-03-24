import mongoose from 'mongoose';

const QPayTokenSchema = new mongoose.Schema({
    token: { type: String, required: true },
    expiresAt: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now }
});

export const QPayToken = mongoose.models.QPayToken || mongoose.model('QPayToken', QPayTokenSchema);
