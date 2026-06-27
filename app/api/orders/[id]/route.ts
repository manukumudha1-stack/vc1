import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import OrderModel from '@/lib/models/Order';
import UserModel from '@/lib/models/User';
import mongoose from 'mongoose';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
    }

    const { notes } = await req.json() as { notes?: string };

    await connectDB();
    const order = await OrderModel.findByIdAndUpdate(
      id,
      { notes: notes ?? '' },
      { new: true }
    ).lean();

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PATCH /api/orders/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    await connectDB();

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
    }

    const order = await OrderModel.findById(id).lean();
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;

    if (isAdmin) return NextResponse.json(order);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const user = await UserModel.findOne({ email: session.user.email }).lean();
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const customerId = order.customerId?.toString();
    if (customerId !== (user._id as mongoose.Types.ObjectId).toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error('[GET /api/orders/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
