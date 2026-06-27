import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILookbook extends Document {
  imageUrl: string;
  caption: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
}

const LookbookSchema = new Schema<ILookbook>(
  {
    imageUrl:  { type: String, required: true },
    caption:   { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
    isActive:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

LookbookSchema.index({ sortOrder: 1 });

const LookbookModel: Model<ILookbook> =
  mongoose.models.Lookbook ||
  mongoose.model<ILookbook>('Lookbook', LookbookSchema);

export default LookbookModel;
