// Sets a random price between ₹1,000 and ₹10,000 on every product.
// Images and all other fields are left untouched.
//
// Usage: npm run update-prices

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname2 = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname2, '../.env.local');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (k && !(k in process.env)) process.env[k] = v;
  }
}

import mongoose from 'mongoose';
import ProductModel from '../lib/models/Product';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI not set'); process.exit(1); }

// ₹1,000 – ₹10,000 in ₹500 steps
function randomPrice() {
  return (Math.floor(Math.random() * 19) + 2) * 500;
}

async function main() {
  await mongoose.connect(MONGODB_URI!);
  const products = await ProductModel.find({}, { slug: 1, name: 1 }).lean();
  console.log(`Updating prices for ${products.length} products...\n`);

  for (const p of products) {
    const price = randomPrice();
    await ProductModel.updateOne({ _id: p._id }, { $set: { price } });
    console.log(`  ✓ ${p.name} → ₹${price.toLocaleString('en-IN')}`);
  }

  console.log('\nDone.');
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
