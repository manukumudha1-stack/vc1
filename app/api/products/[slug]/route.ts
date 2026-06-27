import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import ProductModel from '@/lib/models/Product';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { slug } = await params;
    const product = await ProductModel.findOne({ slug, isActive: true }).populate('collectionId').lean();
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    console.error('[GET /api/products/[slug]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { slug } = await params;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, __v, createdAt, updatedAt, slug: _slug, ...updateData } = await req.json();

    const product = await ProductModel.findOneAndUpdate(
      { slug },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    console.error('[PUT /api/products/[slug]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { slug } = await params;

    const product = await ProductModel.findOneAndDelete({ slug }).lean();

    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/products/[slug]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
