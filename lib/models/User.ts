import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAddress {
  label: string;
  line1: string;
  landmark: string;
  city: string;
  pincode: string;
  state: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  googleId?: string;
  passwordHash?: string;
  phone?: string;
  avatar?: string;
  addresses: IAddress[];
  segment: 'new' | 'returning' | 'vip';
  preferences: {
    favouriteCollection: string;
    notes: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    label:    { type: String, default: 'Home' },
    line1:    { type: String, required: true },
    landmark: { type: String, default: '' },
    city:     { type: String, required: true },
    pincode:  { type: String, required: true },
    state:    { type: String, required: true },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    googleId:     { type: String, sparse: true },
    passwordHash: { type: String, sparse: true },
    phone:    { type: String, default: '' },
    avatar:   { type: String, default: '' },
    addresses:[AddressSchema],
    segment:  { type: String, enum: ['new', 'returning', 'vip'], default: 'new' },
    preferences: {
      favouriteCollection: { type: String, default: '' },
      notes:               { type: String, default: '' },
    },
  },
  { timestamps: true }
);

const UserModel: Model<IUser> =
  mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);

export default UserModel;
