import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import UserModel from '@/lib/models/User';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ productIds: [] });
  }
  await connectDB();
  const user = await UserModel.findOne({ email: session.user.email }).select('wishlist').lean() as { wishlist?: mongoose.Types.ObjectId[] } | null;
  if (!user) return NextResponse.json({ productIds: [] });
  return NextResponse.json({ productIds: (user.wishlist ?? []).map(String) });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { productId } = await req.json() as { productId?: string };
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });

  let objectId: mongoose.Types.ObjectId;
  try {
    objectId = new mongoose.Types.ObjectId(productId);
  } catch {
    return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
  }

  await connectDB();

  // Check if already in wishlist
  const match = await UserModel.findOne({ email: session.user.email, wishlist: objectId }).lean();

  if (match) {
    await UserModel.updateOne({ email: session.user.email }, { $pull: { wishlist: objectId } });
  } else {
    await UserModel.updateOne(
      { email: session.user.email },
      { $addToSet: { wishlist: objectId } },
      { upsert: false }
    );
  }

  const updated = await UserModel.findOne({ email: session.user.email }).select('wishlist').lean() as { wishlist?: mongoose.Types.ObjectId[] } | null;
  return NextResponse.json({ productIds: (updated?.wishlist ?? []).map(String) });
}
