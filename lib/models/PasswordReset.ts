import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPasswordReset extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  used: boolean;
  attempts: number;
}

const PasswordResetSchema = new Schema<IPasswordReset>({
  email:     { type: String, required: true, lowercase: true, unique: true },
  otp:       { type: String, required: true },
  expiresAt: { type: Date,   required: true },
  used:      { type: Boolean, default: false },
  attempts:  { type: Number,  default: 0 },
});

PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetModel: Model<IPasswordReset> =
  mongoose.models.PasswordReset ||
  mongoose.model<IPasswordReset>('PasswordReset', PasswordResetSchema);

export default PasswordResetModel;
