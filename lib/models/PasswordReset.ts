import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPasswordReset extends Document {
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
}

const PasswordResetSchema = new Schema<IPasswordReset>({
  email:     { type: String, required: true, lowercase: true },
  token:     { type: String, required: true, unique: true },
  expiresAt: { type: Date,   required: true },
  used:      { type: Boolean, default: false },
});

PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetModel: Model<IPasswordReset> =
  mongoose.models.PasswordReset ||
  mongoose.model<IPasswordReset>('PasswordReset', PasswordResetSchema);

export default PasswordResetModel;
