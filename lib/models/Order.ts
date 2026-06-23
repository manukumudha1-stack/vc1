import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  sku: string;
  qty: number;
  price: number;
}

export interface IShippingAddress {
  name: string;
  phone: string;
  email: string;
  line1: string;
  landmark: string;
  city: string;
  pincode: string;
  state: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'COD';
export type PaymentStatus = 'pending' | 'collected';

export interface IOrder extends Document {
  orderNumber: string;
  customerId?: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  payment: {
    method: PaymentMethod;
    provider: 'cod' | 'phonepay';
    status: PaymentStatus;
  };
  status: OrderStatus;
  subtotal: number;
  total: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name:      { type: String, required: true },
    sku:       { type: String, required: true },
    qty:       { type: Number, required: true, min: 1 },
    price:     { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    name:     { type: String, required: true },
    phone:    { type: String, required: true },
    email:    { type: String, required: true },
    line1:    { type: String, required: true },
    landmark: { type: String, default: '' },
    city:     { type: String, required: true },
    pincode:  { type: String, required: true },
    state:    { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber:     { type: String, required: true, unique: true },
    customerId:      { type: Schema.Types.ObjectId, ref: 'User', default: null },
    items:           [OrderItemSchema],
    shippingAddress: ShippingAddressSchema,
    payment: {
      method:   { type: String, enum: ['COD'], default: 'COD' },
      provider: { type: String, enum: ['cod', 'phonepay'], default: 'cod' },
      status:   { type: String, enum: ['pending', 'collected'], default: 'pending' },
    },
    status:   { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    subtotal: { type: Number, required: true },
    total:    { type: Number, required: true },
    notes:    { type: String, default: '' },
  },
  { timestamps: true }
);

OrderSchema.index({ customerId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });

const OrderModel: Model<IOrder> =
  mongoose.models.Order ||
  mongoose.model<IOrder>('Order', OrderSchema);

export default OrderModel;
