import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import CollectionModel from '@/lib/models/Collection';

export async function GET() {
  try {
    await connectDB();
    const collections = await CollectionModel.find().sort({ sortOrder: 1 }).lean();
    return NextResponse.json(collections);
  } catch (err) {
    console.error('[GET /api/collections]', err);
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
    const body  = await req.json();
    body.slug   = slugify(body.name);

    const collection = await CollectionModel.create(body);
    return NextResponse.json(collection, { status: 201 });
  } catch (err) {
    console.error('[POST /api/collections]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
