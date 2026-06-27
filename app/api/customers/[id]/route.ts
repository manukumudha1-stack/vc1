import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import UserModel from '@/lib/models/User';
import OrderModel from '@/lib/models/Order';
import mongoose from 'mongoose';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid customer id' }, { status: 400 });
    }

    const deleted = await UserModel.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/customers/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid customer id' }, { status: 400 });
    }

    const customer = await UserModel.findById(id).lean();
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    const orders = await OrderModel.find({ customerId: customer._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ customer, orders });
  } catch (err) {
    console.error('[GET /api/customers/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
