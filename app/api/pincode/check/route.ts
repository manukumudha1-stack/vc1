import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ServiceablePincodeModel from '@/lib/models/ServiceablePincode';

async function checkPin(pin: string) {
  await connectDB();
  const record = await ServiceablePincodeModel.findOne({ pincode: pin.trim() }).lean();
  if (!record) {
    return { serviceable: false, deliverable: false, deliveryDays: null, codAvailable: false, message: 'Sorry, we don\'t deliver to this pincode yet.' };
  }
  return {
    serviceable:  true,
    deliverable:  true,
    deliveryDays: record.deliveryDays,
    codAvailable: record.codAvailable,
    message: `Deliverable in ${record.deliveryDays} day${record.deliveryDays === 1 ? '' : 's'}${record.codAvailable ? ' · COD available' : ''}`,
  };
}

export async function GET(req: NextRequest) {
  try {
    const pin = req.nextUrl.searchParams.get('pin') ?? '';
    if (!pin) return NextResponse.json({ error: 'pin is required' }, { status: 400 });
    return NextResponse.json(await checkPin(pin));
  } catch (err) {
    console.error('[GET /api/pincode/check]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { pincode } = (await req.json()) as { pincode: string };
    if (!pincode) return NextResponse.json({ error: 'pincode is required' }, { status: 400 });
    return NextResponse.json(await checkPin(pincode));
  } catch (err) {
    console.error('[POST /api/pincode/check]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
