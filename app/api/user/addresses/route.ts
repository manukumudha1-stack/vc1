import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import UserModel from '@/lib/models/User';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const user = await UserModel.findOne({ email: session.user.email }).select('addresses').lean();
  return NextResponse.json({ addresses: user?.addresses ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { label, name, phone, line1, landmark, city, pincode, state } = await req.json();
  if (!name || !phone || !line1 || !city || !pincode || !state) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  await connectDB();
  const user = await UserModel.findOneAndUpdate(
    { email: session.user.email },
    { $push: { addresses: { label: label || 'Home', name, phone, line1, landmark: landmark || '', city, pincode, state } } },
    { returnDocument: 'after', select: 'addresses' }
  ).lean();
  return NextResponse.json({ addresses: user?.addresses ?? [] });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { label, name, phone, line1, landmark, city, pincode, state } = await req.json();
  if (!name || !phone || !line1 || !city || !pincode || !state) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  await connectDB();
  const user = await UserModel.findOneAndUpdate(
    { email: session.user.email, 'addresses._id': id },
    { $set: {
      'addresses.$.label':    label || 'Home',
      'addresses.$.name':     name,
      'addresses.$.phone':    phone,
      'addresses.$.line1':    line1,
      'addresses.$.landmark': landmark || '',
      'addresses.$.city':     city,
      'addresses.$.pincode':  pincode,
      'addresses.$.state':    state,
    }},
    { returnDocument: 'after', select: 'addresses' }
  ).lean();
  return NextResponse.json({ addresses: user?.addresses ?? [] });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url   = new URL(req.url);
  const id    = url.searchParams.get('id');
  const idxRaw = url.searchParams.get('idx');
  const email = session.user.email;

  await connectDB();

  // Fast path: valid _id present — use $pull
  if (id && id !== 'undefined' && id !== 'null') {
    const user = await UserModel.findOneAndUpdate(
      { email },
      { $pull: { addresses: { _id: id } } },
      { returnDocument: 'after', select: 'addresses' }
    ).lean();
    return NextResponse.json({ addresses: user?.addresses ?? [] });
  }

  // Fallback: no valid _id (old addresses) — remove by array index
  const idx = idxRaw !== null ? parseInt(idxRaw, 10) : NaN;
  if (isNaN(idx)) {
    return NextResponse.json({ error: 'Missing id or idx' }, { status: 400 });
  }

  // MongoDB has no native "remove by index"; unset then pull nulls
  await UserModel.updateOne({ email }, { $unset: { [`addresses.${idx}`]: '' } });
  const user = await UserModel.findOneAndUpdate(
    { email },
    { $pull: { addresses: null } },
    { returnDocument: 'after', select: 'addresses' }
  ).lean();

  return NextResponse.json({ addresses: user?.addresses ?? [] });
}
