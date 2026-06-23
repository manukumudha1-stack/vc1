import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { generateOrderNumber } from '@/lib/utils';
import { sendOrderConfirmation, sendWhatsApp } from '@/lib/notifications';
import ProductModel from '@/lib/models/Product';
import OrderModel from '@/lib/models/Order';
import UserModel from '@/lib/models/User';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status');
    const limit  = Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10));
    const page   = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10));

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const total  = await OrderModel.countDocuments(filter);
    const orders = await OrderModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ orders, total });
  } catch (err) {
    console.error('[GET /api/orders]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    const body    = await req.json();

    const { items, shippingAddress, notes } = body as {
      items: { productId: string; qty: number }[];
      shippingAddress: {
        name: string; phone: string; email: string;
        line1: string; landmark?: string;
        city: string; pincode: string; state: string;
      };
      notes?: string;
    };

    if (!items?.length) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
    }

    const productIds = items.map(i => new mongoose.Types.ObjectId(i.productId));
    const products   = await ProductModel.find({ _id: { $in: productIds }, isActive: true });

    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found or unavailable` },
          { status: 400 }
        );
      }
      if (product.stockQty < item.qty) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }
    }

    const orderItems = items.map(item => {
      const p = productMap.get(item.productId)!;
      return {
        productId: p._id,
        name:      p.name,
        sku:       p.sku,
        qty:       item.qty,
        price:     p.price,
      };
    });

    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);

    for (const item of items) {
      await ProductModel.findByIdAndUpdate(item.productId, {
        $inc: { stockQty: -item.qty },
      });
    }

    let customerId: mongoose.Types.ObjectId | undefined;
    if (session?.user?.email) {
      const user = await UserModel.findOne({ email: session.user.email }).lean();
      if (user) customerId = user._id as mongoose.Types.ObjectId;
    }

    const orderDoc = new OrderModel({
      orderNumber:     generateOrderNumber(),
      customerId:      customerId,
      items:           orderItems,
      shippingAddress: {
        ...shippingAddress,
        landmark: shippingAddress.landmark ?? '',
      },
      payment: { method: 'COD', provider: 'cod', status: 'pending' },
      status:   'pending',
      subtotal,
      total:    subtotal,
      notes:    notes ?? '',
    });
    await orderDoc.save();

    const confirmMsg = `Hi ${shippingAddress.name}, your VC Sarees order ${orderDoc.orderNumber} has been placed. Total: ₹${subtotal.toLocaleString('en-IN')}. We'll call before delivery.`;

    await Promise.allSettled([
      sendOrderConfirmation(orderDoc),
      sendWhatsApp(shippingAddress.phone, confirmMsg),
    ]);

    return NextResponse.json({ orderId: orderDoc._id, orderNumber: orderDoc.orderNumber }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/orders]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
