import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { message: 'PhonePe integration not yet implemented' },
    { status: 501 }
  );
}
