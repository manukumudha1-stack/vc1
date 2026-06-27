// Load .env.local manually (no dotenv required — uses Node.js built-ins)
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname2 = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname2, '../.env.local');
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !(key in process.env)) process.env[key] = val;
  }
  console.log(`Loaded env from ${envPath}`);
} else {
  console.warn(`No .env.local found at ${envPath} — using existing process.env`);
}

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import CollectionModel  from '../lib/models/Collection';
import ProductModel     from '../lib/models/Product';
import UserModel        from '../lib/models/User';
import AdminModel       from '../lib/models/Admin';
import OrderModel       from '../lib/models/Order';
import LookbookModel    from '../lib/models/Lookbook';
import SiteConfigModel  from '../lib/models/SiteConfig';
import ServiceablePincodeModel from '../lib/models/ServiceablePincode';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not set. Create .env.local with MONGODB_URI=...');
  process.exit(1);
}

function slugify(text: string): string {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function generateOrderNumber(): string {
  const now = new Date();
  const yy  = String(now.getFullYear()).slice(-2);
  const mm  = String(now.getMonth() + 1).padStart(2, '0');
  const dd  = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `VC-${yy}${mm}${dd}-${rand}`;
}

async function seed() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI as string, { bufferCommands: false });
  console.log('Connected.\n');

  // ── 1. Admin ──────────────────────────────────────────────────────────────
  const adminEmail    = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('WARN: SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD not set — skipping admin seed.');
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await AdminModel.findOneAndUpdate(
      { email: adminEmail.toLowerCase() },
      { $set: { email: adminEmail.toLowerCase(), passwordHash, role: 'super' } },
      { upsert: true, new: true }
    );
    console.log(`✓ Admin       : ${adminEmail}`);
  }

  // ── 2. Customer User ──────────────────────────────────────────────────────
  const userPasswordHash = await bcrypt.hash('Test@12345', 12);
  const userDoc = await UserModel.findOneAndUpdate(
    { email: 'customer@vc-sarees.com' },
    {
      $set: {
        name:         'Priya Sharma',
        email:        'customer@vc-sarees.com',
        passwordHash: userPasswordHash,
        phone:        '9876543210',
        segment:      'returning',
        addresses: [
          {
            label:    'Home',
            line1:    '12, Kaveri Layout, 2nd Cross',
            landmark: 'Near Vijayanagar Metro',
            city:     'Bengaluru',
            pincode:  '560025',
            state:    'Karnataka',
          },
        ],
        preferences: {
          favouriteCollection: 'ilkal-silk',
          notes:               'Prefers bridal silks',
        },
      },
    },
    { upsert: true, new: true }
  );
  console.log(`✓ User        : ${userDoc.email}`);

  // ── 3. Collection ─────────────────────────────────────────────────────────
  const collection = await CollectionModel.findOneAndUpdate(
    { slug: 'ilkal-silk' },
    {
      $set: {
        name:          'Ilkal Silk',
        slug:          'ilkal-silk',
        description:   'Handwoven pure silk sarees from Ilkal, Karnataka — distinguished by the tope teni pallu and kasuti embroidery. A GI-tagged heritage of North Karnataka.',
        coverImageUrl: '',   // upload via admin panel
        sortOrder:     1,
      },
    },
    { upsert: true, new: true }
  );
  console.log(`✓ Collection  : ${collection.name}`);

  // ── 4. Product ────────────────────────────────────────────────────────────
  // Images left empty — upload real Cloudinary images via the admin panel.
  const productSlug = slugify('Ilkal Kasuti Border Silk');
  const product = await ProductModel.findOneAndUpdate(
    { sku: 'VC-ILK-0101' },
    {
      $set: {
        name:             'Ilkal Kasuti Border Silk',
        slug:             productSlug,
        sku:              'VC-ILK-0101',
        collectionId:     collection._id,
        fabric:           'Pure Mulberry Silk',
        region:           'Ilkal, Bagalkot District, Karnataka',
        zariType:         'Silver Zari',
        occasion:         ['Wedding', 'Festival'],
        price:            38500,
        stockQty:         5,
        blousePiece:      'included',
        weaver:           'Ilkal Weavers Cooperative Society',
        makerImageUrl:    '',   // upload via admin panel
        isFeatured:       true,
        isActive:         true,
        description:
          'A treasured example of Ilkal\'s GI-tagged craft — a cream silk body grounded by the iconic tope teni (joined pallu) technique. ' +
          'The six-inch silver zari pallu is framed by a kasuti hand-embroidered border featuring the traditional menthi flower motif in deep crimson thread.',
        story:
          'Ilkal sarees have been woven in the Bagalkot district of northern Karnataka for over five centuries. ' +
          'The tope teni technique — where the pallu is woven separately on a different loom and then joined using an interlocking thread — is unique to Ilkal. ' +
          'This piece took two weavers eleven days to complete.',
        careInstructions:
          'Dry clean only. Wrap in soft muslin cloth for storage. Keep away from direct sunlight. ' +
          'Unfold and refold along different lines every six months to prevent crease marks.',
        images: [],   // add Cloudinary images via admin panel
      },
    },
    { upsert: true, new: true }
  );
  console.log(`✓ Product     : ${product.name} (${product.sku})`);

  // ── 5. Pincodes ───────────────────────────────────────────────────────────
  const pincodesData = [
    { pincode: '560001', city: 'Bengaluru Central', deliveryDays: 2, codAvailable: true },
    { pincode: '560011', city: 'Bengaluru',         deliveryDays: 2, codAvailable: true },
    { pincode: '560025', city: 'Jayanagar',         deliveryDays: 2, codAvailable: true },
    { pincode: '560052', city: 'Whitefield',        deliveryDays: 2, codAvailable: true },
    { pincode: '560066', city: 'Rajajinagar',       deliveryDays: 2, codAvailable: true },
    { pincode: '570002', city: 'Mysuru',            deliveryDays: 3, codAvailable: true },
    { pincode: '500034', city: 'Hyderabad',         deliveryDays: 4, codAvailable: true },
    { pincode: '520010', city: 'Vijayawada',        deliveryDays: 4, codAvailable: true },
    { pincode: '110001', city: 'Delhi',             deliveryDays: 5, codAvailable: true },
    { pincode: '400001', city: 'Mumbai',            deliveryDays: 5, codAvailable: true },
  ];

  for (const pin of pincodesData) {
    await ServiceablePincodeModel.findOneAndUpdate(
      { pincode: pin.pincode },
      { $set: { pincode: pin.pincode, deliveryDays: pin.deliveryDays, codAvailable: pin.codAvailable } },
      { upsert: true, new: true }
    );
  }
  console.log(`✓ Pincodes    : ${pincodesData.length} upserted`);

  // ── 6. Site Config ────────────────────────────────────────────────────────
  await SiteConfigModel.findOneAndUpdate(
    {},
    {
      $set: {
        trustItems: [
          'Free shipping above ₹5,000',
          'Easy 15-day returns',
          'Secure payment',
          '100% authentic handloom',
        ],
        pageContents: {
          ourStory:   '',
          theWeavers: '',
          care:       '',
          shipping:   '',
          returns:    '',
          privacy:    '',
          terms:      '',
        },
      },
    },
    { upsert: true, new: true }
  );
  console.log(`✓ Site Config : upserted`);

  // ── 7. Lookbook ───────────────────────────────────────────────────────────
  // imageUrl left blank — replace with a real Cloudinary URL via admin panel.
  const existingLookbook = await LookbookModel.findOne({});
  if (!existingLookbook) {
    await LookbookModel.create({
      imageUrl:  'https://res.cloudinary.com/placeholder/image/upload/v1/vc-sarees/lookbook-sample',
      caption:   'Sample Lookbook Entry — replace image via admin panel',
      sortOrder: 1,
      isActive:  false,
    });
    console.log(`✓ Lookbook    : 1 sample entry created (inactive, update image via admin)`);
  } else {
    console.log(`✓ Lookbook    : existing entries preserved`);
  }

  // ── 8. Sample Order ───────────────────────────────────────────────────────
  const SEED_ORDER_NUMBER = 'VC-SEED-0001';
  const existingOrder = await OrderModel.findOne({ orderNumber: SEED_ORDER_NUMBER });
  if (!existingOrder) {
    const now = new Date();
    await OrderModel.create({
      orderNumber: SEED_ORDER_NUMBER,
      customerId:  userDoc._id,
      items: [
        {
          productId: product._id,
          name:      product.name,
          sku:       product.sku,
          qty:       1,
          price:     product.price,
          image:     '',
        },
      ],
      shippingAddress: {
        name:     'Priya Sharma',
        phone:    '9876543210',
        email:    'customer@vc-sarees.com',
        line1:    '12, Kaveri Layout, 2nd Cross',
        landmark: 'Near Vijayanagar Metro',
        city:     'Bengaluru',
        pincode:  '560025',
        state:    'Karnataka',
      },
      payment: { method: 'COD', provider: 'cod', status: 'pending' },
      status:   'confirmed',
      subtotal: product.price,
      total:    product.price,
      notes:    'Seed order for testing',
      statusHistory: [
        { status: 'placed',    changedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
        { status: 'confirmed', changedAt: now },
      ],
    });
    console.log(`✓ Order       : ${SEED_ORDER_NUMBER} created`);
  } else {
    console.log(`✓ Order       : ${SEED_ORDER_NUMBER} already exists`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const [colCount, prodCount, pinCount, userCount, adminCount, orderCount, lookbookCount] =
    await Promise.all([
      CollectionModel.countDocuments(),
      ProductModel.countDocuments(),
      ServiceablePincodeModel.countDocuments(),
      UserModel.countDocuments(),
      AdminModel.countDocuments(),
      OrderModel.countDocuments(),
      LookbookModel.countDocuments(),
    ]);

  console.log('\n── Seed Complete ──────────────────────────────────');
  console.log(`  Collections : ${colCount}`);
  console.log(`  Products    : ${prodCount}`);
  console.log(`  Pincodes    : ${pinCount}`);
  console.log(`  Users       : ${userCount}`);
  console.log(`  Admins      : ${adminCount}`);
  console.log(`  Orders      : ${orderCount}`);
  console.log(`  Lookbook    : ${lookbookCount}`);
  console.log('───────────────────────────────────────────────────\n');
  console.log('  Customer login : customer@vc-sarees.com / Test@12345');
  if (adminEmail) console.log(`  Admin login    : ${adminEmail} / (your SEED_ADMIN_PASSWORD)`);
  console.log('  Note: Product and lookbook images need uploading via the admin panel.\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
