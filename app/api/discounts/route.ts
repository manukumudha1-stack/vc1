import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import DiscountModel from '@/lib/models/Discount';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const discounts = await DiscountModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(discounts);
  } catch (err) {
    console.error('[GET /api/discounts]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body     = await req.json();
    const discount = await DiscountModel.create(body);
    return NextResponse.json(discount, { status: 201 });
  } catch (err) {
    console.error('[POST /api/discounts]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id, ...fields } = await req.json();

    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Valid discount id required' }, { status: 400 });
    }

    const discount = await DiscountModel.findByIdAndUpdate(
      id,
      { $set: fields },
      { new: true, runValidators: true }
    ).lean();

    if (!discount) return NextResponse.json({ error: 'Discount not found' }, { status: 404 });
    return NextResponse.json(discount);
  } catch (err) {
    console.error('[PUT /api/discounts]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
