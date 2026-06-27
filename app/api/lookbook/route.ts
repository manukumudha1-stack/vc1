import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import LookbookModel from '@/lib/models/Lookbook';

export async function GET() {
  try {
    await connectDB();
    const items = await LookbookModel.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 }).lean();
    return NextResponse.json(items);
  } catch (err) {
    console.error('[GET /api/lookbook]', err);
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
    const body = await req.json();
    const item = await LookbookModel.create(body);
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error('[POST /api/lookbook]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
