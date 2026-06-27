import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import LookbookModel from '@/lib/models/Lookbook';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const { id } = await params;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, __v, createdAt, updatedAt, ...updateData } = await req.json();
    const item = await LookbookModel.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).lean();
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch (err) {
    console.error('[PUT /api/lookbook/[id]]', err);
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
    const { id } = await params;
    await LookbookModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/lookbook/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
