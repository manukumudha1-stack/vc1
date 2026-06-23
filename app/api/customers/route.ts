import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import UserModel from '@/lib/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = req.nextUrl;
    const segment = searchParams.get('segment');
    const limit   = Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10));
    const page    = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10));

    const filter: Record<string, unknown> = {};
    if (segment) filter.segment = segment;

    const total     = await UserModel.countDocuments(filter);
    const customers = await UserModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ customers, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[GET /api/customers]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
