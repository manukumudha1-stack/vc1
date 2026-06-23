import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import UserModel from '@/lib/models/User';
import PasswordResetModel from '@/lib/models/PasswordReset';
import { sendPasswordResetEmail } from '@/lib/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OK = { success: true, message: 'If that email is registered, a reset link has been sent.' };

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

    const token = crypto.randomBytes(32).toString('hex');
    await PasswordResetModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { token, expiresAt: new Date(Date.now() + 3_600_000), used: false } },
      { upsert: true, new: true }
    );

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
    sendPasswordResetEmail(email.toLowerCase(), resetUrl).catch(() => {});

    return NextResponse.json(OK);
  } catch (err) {
    console.error('[forgot-password] Unexpected error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
