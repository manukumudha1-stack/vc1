import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICollection extends Document {
  name: string;
  slug: string;
  description: string;
  coverImageUrl: string;
  sortOrder: number;
  createdAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    name:          { type: String, required: true, trim: true },
    slug:          { type: String, required: true, unique: true, lowercase: true },
    description:   { type: String, default: '' },
    coverImageUrl: { type: String, default: '' },
    sortOrder:     { type: Number, default: 0 },
  },
  { timestamps: true }
);

CollectionSchema.index({ sortOrder: 1 });

const CollectionModel: Model<ICollection> =
  mongoose.models.Collection ||
  mongoose.model<ICollection>('Collection', CollectionSchema);

export default CollectionModel;
