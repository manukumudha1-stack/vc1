import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateUploadSignature } from '@/lib/cloudinary';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = generateUploadSignature();
    return NextResponse.json(params);
  } catch (err) {
    console.error('[POST /api/upload]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
