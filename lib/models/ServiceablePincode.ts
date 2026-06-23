import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IServiceablePincode extends Document {
  pincode: string;
  deliveryDays: number;
  codAvailable: boolean;
}

const ServiceablePincodeSchema = new Schema<IServiceablePincode>(
  {
    pincode:      { type: String, required: true, unique: true, index: true },
    deliveryDays: { type: Number, required: true, default: 5 },
    codAvailable: { type: Boolean, default: true },
  },
  { timestamps: false }
);

const ServiceablePincodeModel: Model<IServiceablePincode> =
  mongoose.models.ServiceablePincode ||
  mongoose.model<IServiceablePincode>('ServiceablePincode', ServiceablePincodeSchema);

export default ServiceablePincodeModel;
