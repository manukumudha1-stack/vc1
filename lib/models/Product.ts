import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IProductImage {
  url: string;
  caption: string;
  cloudinaryId: string;
}

export interface IOffer {
  isActive: boolean;
  discountPct: number;
  startDate: Date | null;
  endDate: Date | null;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  collectionId: Types.ObjectId;
  fabric: string;
  region: string;
  zariType: string;
  occasion: string[];
  price: number;
  stockQty: number;
  images: IProductImage[];
  blousePiece: 'included' | 'not_included' | 'on_request';
  weaver: string;
  makerImageUrl: string;
  description: string;
  story: string;
  careInstructions: string;
  isFeatured: boolean;
  isActive: boolean;
  offer: IOffer;
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema<IProductImage>(
  {
    url:          { type: String, required: true },
    caption:      { type: String, default: '' },
    cloudinaryId: { type: String, default: '' },
  },
  { _id: false }
);

const OfferSchema = new Schema<IOffer>(
  {
    isActive:    { type: Boolean, default: false },
    discountPct: { type: Number, default: 0, min: 0, max: 100 },
    startDate:   { type: Date, default: null },
    endDate:     { type: Date, default: null },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name:             { type: String, required: true, trim: true },
    slug:             { type: String, required: true, unique: true, lowercase: true },
    sku:              { type: String, required: true, unique: true, uppercase: true },
    collectionId:     { type: Schema.Types.ObjectId, ref: 'Collection', required: true },
    fabric:           { type: String, default: '' },
    region:           { type: String, default: '' },
    zariType:         { type: String, default: '' },
    occasion:         [{ type: String }],
    price:            { type: Number, required: true, min: 0 },
    stockQty:         { type: Number, required: true, default: 0, min: 0 },
    images:           [ProductImageSchema],
    blousePiece:      { type: String, enum: ['included', 'not_included', 'on_request'], default: 'included' },
    weaver:           { type: String, default: '' },
    makerImageUrl:    { type: String, default: '' },
    description:      { type: String, default: '' },
    story:            { type: String, default: '' },
    careInstructions: { type: String, default: '' },
    isFeatured:       { type: Boolean, default: false },
    isActive:         { type: Boolean, default: true },
    offer:            { type: OfferSchema, default: () => ({ isActive: false, discountPct: 0, startDate: null, endDate: null }) },
  },
  { timestamps: true }
);

ProductSchema.index({ collectionId: 1, isActive: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ region: 1 });
ProductSchema.index({ zariType: 1 });
ProductSchema.index({ occasion: 1 });

const ProductModel: Model<IProduct> =
  mongoose.models.Product ||
  mongoose.model<IProduct>('Product', ProductSchema);

export default ProductModel;
