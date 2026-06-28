import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import OrderModel from '@/lib/models/Order';
import ProductModel from '@/lib/models/Product';
import UserModel from '@/lib/models/User';
import { sendStatusCancelled } from '@/lib/notifications';
import type { IOrder } from '@/lib/models/Order';

type Params = { params: Promise<{ id: string }> };

const CANCELLABLE: string[] = ['pending', 'confirmed'];

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Sign in to cancel an order.' }, { status: 401 });
    }
    const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;
    if (isAdmin) {
      return NextResponse.json({ error: 'Use the admin panel to cancel orders.' }, { status: 403 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid order id.' }, { status: 400 });
    }

    await connectDB();

    const user = await UserModel.findOne({ email: session.user.email }).lean();
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 403 });

    const order = await OrderModel.findById(id);
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    if (order.customerId?.toString() !== (user._id as mongoose.Types.ObjectId).toString()) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    if (!CANCELLABLE.includes(order.status)) {
      return NextResponse.json(
        { error: `Orders that are ${order.status} cannot be cancelled.` },
        { status: 400 }
      );
    }

    await OrderModel.findByIdAndUpdate(id, {
      $set:  { status: 'cancelled' },
      $push: { statusHistory: { status: 'cancelled', changedAt: new Date() } },
    });

    // Restore stock
    const bulkOps = order.items.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { stockQty: item.qty } },
      },
    }));
    if (bulkOps.length > 0) await ProductModel.bulkWrite(bulkOps);

    sendStatusCancelled(order as IOrder).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/orders/[id]/cancel]', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
