import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdmin extends Document {
  email: string;
  passwordHash: string;
  role: 'super' | 'manager';
  createdAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email:        { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role:         { type: String, enum: ['super', 'manager'], default: 'manager' },
  },
  { timestamps: true }
);

const AdminModel: Model<IAdmin> =
  mongoose.models.Admin ||
  mongoose.model<IAdmin>('Admin', AdminSchema);

export default AdminModel;
