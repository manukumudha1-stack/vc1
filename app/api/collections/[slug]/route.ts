import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import CollectionModel from '@/lib/models/Collection';
import ProductModel from '@/lib/models/Product';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  await connectDB();
  const collection = await CollectionModel.findOne({ slug }).lean();
  if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(collection);
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  await connectDB();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, __v, createdAt, updatedAt, slug: _slug, ...updateData } = await req.json();
  if (updateData.name) updateData.slug = slugify(updateData.name);

  const updated = await CollectionModel.findOneAndUpdate(
    { slug },
    { $set: updateData },
    { new: true }
  );
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  await connectDB();

  const collection = await CollectionModel.findOne({ slug });
  if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Unlink products before deleting the collection
  await ProductModel.updateMany({ collectionId: collection._id }, { $unset: { collectionId: '' } });
  await CollectionModel.findOneAndDelete({ slug });
  return NextResponse.json({ ok: true });
}
