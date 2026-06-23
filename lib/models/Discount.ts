import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDiscount extends Document {
  code: string;
  type: 'invite' | 'private' | 'welcome' | 'seasonal';
  value: {
    kind: 'flat' | 'percent' | 'free_shipping';
    amount: number;
  };
  appliesTo: string;
  usageCount: number;
  maxUses?: number;
  validUntil?: Date;
  status: 'active' | 'scheduled' | 'expired';
  createdAt: Date;
}

const DiscountSchema = new Schema<IDiscount>(
  {
    code:       { type: String, required: true, unique: true, uppercase: true },
    type:       { type: String, enum: ['invite', 'private', 'welcome', 'seasonal'], required: true },
    value: {
      kind:   { type: String, enum: ['flat', 'percent', 'free_shipping'], required: true },
      amount: { type: Number, default: 0 },
    },
    appliesTo:  { type: String, default: 'all' },
    usageCount: { type: Number, default: 0 },
    maxUses:    { type: Number, default: null },
    validUntil: { type: Date, default: null },
    status:     { type: String, enum: ['active', 'scheduled', 'expired'], default: 'active' },
  },
  { timestamps: true }
);

const DiscountModel: Model<IDiscount> =
  mongoose.models.Discount ||
  mongoose.model<IDiscount>('Discount', DiscountSchema);

export default DiscountModel;
