import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import UserModel from '@/lib/models/User';
import PasswordResetModel from '@/lib/models/PasswordReset';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { token?: string; password?: string };
    const { token, password } = body;

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return NextResponse.json({ error: 'Reset token is required.' }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    await connectDB();

    const reset = await PasswordResetModel.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!reset) {
      return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 12);

    await UserModel.findOneAndUpdate(
      { email: reset.email },
      { $set: { passwordHash: hash } }
    );

    await PasswordResetModel.updateOne({ token }, { $set: { used: true } });

    return NextResponse.json({ success: true, message: 'Password updated.' });
  } catch (err) {
    console.error('[reset-password] Unexpected error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
