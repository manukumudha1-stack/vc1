import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import ProductModel from '@/lib/models/Product';
import CollectionModel from '@/lib/models/Collection';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = req.nextUrl;
    const q          = searchParams.get('q')?.trim();
    const collection = searchParams.get('collection');
    const region     = searchParams.get('region');
    const zari       = searchParams.get('zari');
    const occasion   = searchParams.get('occasion');
    const minPrice   = searchParams.get('minPrice');
    const maxPrice   = searchParams.get('maxPrice');
    const limit      = Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10));
    const page       = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10));

    const filter: Record<string, unknown> = { isActive: true };

    if (q) {
      const re = { $regex: q, $options: 'i' };
      filter.$or = [{ name: re }, { fabric: re }, { region: re }, { sku: re }];
    }

    if (collection) {
      if (mongoose.isValidObjectId(collection)) {
        filter.collectionId = new mongoose.Types.ObjectId(collection);
      } else {
        const col = await CollectionModel.findOne({ slug: collection }).lean();
        if (col) filter.collectionId = col._id;
        else return NextResponse.json({ products: [], total: 0, page, pages: 0 });
      }
    }

    if (region)   filter.region   = region;
    if (zari)     filter.zariType = zari;
    if (occasion) filter.occasion = occasion;

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      filter.price = priceFilter;
    }

    const total    = await ProductModel.countDocuments(filter);
    const products = await ProductModel.find(filter)
      .populate('collectionId')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[GET /api/products]', err);
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
    body.slug = slugify(body.name);

    const product = await ProductModel.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error('[POST /api/products]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
