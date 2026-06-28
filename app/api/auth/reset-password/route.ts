import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import UserModel from '@/lib/models/User';
import PasswordResetModel from '@/lib/models/PasswordReset';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email?: string; otp?: string; password?: string };
    const { email, otp, password } = body;

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }
    if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: 'A 6-digit OTP is required.' }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    await connectDB();

    const reset = await PasswordResetModel.findOne({
      email: email.toLowerCase(),
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!reset) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    if (reset.attempts >= 5) {
      return NextResponse.json({ error: 'Too many incorrect attempts. Please request a new OTP.' }, { status: 400 });
    }

    if (reset.otp !== otp) {
      await PasswordResetModel.updateOne({ email: email.toLowerCase() }, { $inc: { attempts: 1 } });
      const remaining = 4 - reset.attempts;
      return NextResponse.json(
        { error: `Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 12);

    await UserModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { passwordHash: hash } }
    );

    await PasswordResetModel.updateOne({ email: email.toLowerCase() }, { $set: { used: true } });

    return NextResponse.json({ success: true, message: 'Password updated.' });
  } catch (err) {
    console.error('[reset-password] Unexpected error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
