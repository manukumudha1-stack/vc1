import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { sendShippedNotification } from '@/lib/notifications';
import OrderModel from '@/lib/models/Order';
import type { IOrder, OrderStatus } from '@/lib/models/Order';
import mongoose from 'mongoose';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
    }

    const { status } = (await req.json()) as { status: OrderStatus };

    const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const order = await OrderModel.findByIdAndUpdate(
      id,
      {
        $set:  { status },
        $push: { statusHistory: { status, changedAt: new Date() } },
      },
      { new: true }
    );

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (status === 'shipped') {
      await sendShippedNotification(order as IOrder);
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error('[PUT /api/orders/[id]/status]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
