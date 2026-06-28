import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import UserModel from '@/lib/models/User';
import PasswordResetModel from '@/lib/models/PasswordReset';
import { sendPasswordResetEmail } from '@/lib/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OK = { success: true, message: 'If that email is registered, an OTP has been sent.' };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email?: string };
    const { email } = body;

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    await connectDB();

    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(OK);
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    await PasswordResetModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { otp, expiresAt: new Date(Date.now() + 15 * 60 * 1000), used: false, attempts: 0 } },
      { upsert: true, new: true }
    );

    sendPasswordResetEmail(email.toLowerCase(), otp).catch(() => {});

    return NextResponse.json(OK);
  } catch (err) {
    console.error('[forgot-password] Unexpected error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
