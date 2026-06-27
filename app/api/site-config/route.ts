import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SiteConfigModel from '@/lib/models/SiteConfig';
import { auth } from '@/lib/auth';

const DEFAULT_CONFIG = {
  trustItems: [
    'Free shipping above ₹5,000',
    'Easy 15-day returns',
    'Secure payment',
    '100% authentic handloom',
  ],
  footerShopLinks: [
    { label: 'Ilkal Silk',       href: '/collections/ilkal-silk' },
    { label: 'Paithani Silk',    href: '/collections/paithani-silk' },
    { label: 'Gadwal Silk',      href: '/collections/gadwal-silk' },
    { label: 'Mix Silk',         href: '/collections/mix-silk' },
    { label: 'All Collections',  href: '/collections' },
  ],
  footerHouseLinks: [
    { label: 'Our Story',       href: '/heritage' },
    { label: 'The Weavers',     href: '/heritage/weavers' },
    { label: 'Lookbook',        href: '/lookbook' },
    { label: 'Sustainability',  href: '/heritage/sustainability' },
    { label: 'Blog',            href: '/journal' },
  ],
  footerCareLinks: [
    { label: 'Care Instructions', href: '/care' },
    { label: 'Shipping Policy',   href: '/shipping' },
    { label: 'Returns & Exchange',href: '/returns' },
    { label: 'Privacy Policy',    href: '/privacy' },
    { label: 'Terms of Use',      href: '/terms' },
  ],
};

export async function GET() {
  try {
    await connectDB();
    const cfg = await SiteConfigModel.findOne({}).lean();
    return NextResponse.json(cfg || DEFAULT_CONFIG);
  } catch {
    return NextResponse.json(DEFAULT_CONFIG);
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session || !(session.user as { isAdmin?: boolean })?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();

    // Strip internal Mongoose/MongoDB fields before $set
    const { _id, __v, createdAt, updatedAt, ...data } = body;
    void _id; void __v; void createdAt; void updatedAt;

    const saved = await SiteConfigModel.findOneAndUpdate(
      {},
      { $set: data },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json(saved);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
