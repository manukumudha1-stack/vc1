// Searches Flipkart for each product by name, downloads images, uploads to
// Cloudinary, and updates MongoDB with image URLs + a randomised price.
//
// Usage: npm run seed:images
// Requires: .env.local with MONGODB_URI, CLOUDINARY_* vars

import { readFileSync, existsSync, mkdirSync, createWriteStream, rmSync } from 'fs';
import { resolve, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import { URL } from 'url';

// ── Load .env.local ──────────────────────────────────────────────────────────
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
  console.warn(`No .env.local found — using existing process.env`);
}

import axios from 'axios';
import { load as cheerioLoad } from 'cheerio';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import ProductModel from '../lib/models/Product';

// ── Config ───────────────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not set in .env.local');
  process.exit(1);
}

const MAX_IMAGES   = 4;   // max images to upload per product
const REQUEST_DELAY = 2000; // ms between products to avoid rate-limiting

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: 'https://www.flipkart.com/',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function randomPrice(): number {
  // ₹1,000 to ₹1,00,000 in ₹500 increments
  return (Math.floor(Math.random() * 199) + 2) * 500;
}

function sleep(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms));
}

// Flipkart serves low-res thumbnails — upgrade to full resolution
function upgradeToFullRes(url: string): string {
  return url
    .replace(/\/{w}x{h}-/gi, '/')
    .replace(/\/\d+x\d+-/g, '/')
    .replace(/\/\d+\/\d+\//g, '/832/832/')
    .replace(/q=\d+/, 'q=90');
}

async function searchFlipkart(productName: string): Promise<string | null> {
  const query = encodeURIComponent(`${productName} saree`);
  const searchUrl = `https://www.flipkart.com/search?q=${query}&sort=relevance`;
  try {
    const { data } = await axios.get<string>(searchUrl, {
      headers: BROWSER_HEADERS,
      timeout: 15000,
    });
    const $ = cheerioLoad(data);
    let found: string | null = null;
    // Flipkart product URLs always contain /p/ in the path
    $('a[href*="/p/"]').each((_, el) => {
      const href = $(el).attr('href') ?? '';
      if (href.includes('/p/')) {
        found = href.startsWith('http') ? href : `https://www.flipkart.com${href}`;
        return false; // break
      }
    });
    return found;
  } catch (err: any) {
    console.warn(`    Search request failed: ${err.message}`);
    return null;
  }
}

async function extractImageUrls(pageUrl: string): Promise<string[]> {
  try {
    const { data } = await axios.get<string>(pageUrl, {
      headers: BROWSER_HEADERS,
      timeout: 15000,
    });
    const $ = cheerioLoad(data);
    const seen = new Set<string>();
    const urls: string[] = [];

    // Multiple selectors to handle Flipkart's occasional class-name changes
    const selectors = [
      'img._396cs4',
      'img._2r_T1I',
      'img.q6DClP',
      'img.DByuf4',
      'img[src*="rukminim"]',
    ];

    for (const sel of selectors) {
      $(sel).each((_, el) => {
        const raw = $(el).attr('src') || $(el).attr('data-src') || '';
        if (!raw || raw.startsWith('data:')) return;
        const full = upgradeToFullRes(raw);
        if (!seen.has(full) && urls.length < MAX_IMAGES) {
          seen.add(full);
          urls.push(full);
        }
      });
      if (urls.length >= MAX_IMAGES) break;
    }
    return urls;
  } catch (err: any) {
    console.warn(`    Page fetch failed: ${err.message}`);
    return [];
  }
}

function downloadImage(imageUrl: string, destPath: string): Promise<void> {
  const proto = imageUrl.startsWith('https') ? https : http;
  return new Promise((resolve, reject) => {
    proto
      .get(imageUrl, { headers: { 'User-Agent': BROWSER_HEADERS['User-Agent'] } }, res => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const file = createWriteStream(destPath);
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
        file.on('error', reject);
      })
      .on('error', reject);
  });
}

async function uploadToCloudinary(
  localPath: string
): Promise<{ url: string; cloudinaryId: string } | null> {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      folder: 'vc-sarees',
      resource_type: 'image',
    });
    return {
      url: result.secure_url,
      cloudinaryId: result.asset_id ?? result.public_id,
    };
  } catch (err: any) {
    console.warn(`    Cloudinary upload failed: ${err.message}`);
    return null;
  }
}

// ── Per-product pipeline ─────────────────────────────────────────────────────

async function fetchAndUploadImages(
  slug: string,
  name: string
): Promise<Array<{ url: string; caption: string; cloudinaryId: string }>> {
  console.log(`\n→ ${name}`);

  const productPageUrl = await searchFlipkart(name);
  if (!productPageUrl) {
    console.log(`  ⚠  No Flipkart result — skipping images`);
    return [];
  }
  console.log(`  Flipkart page: ${productPageUrl}`);

  await sleep(600);
  const imageUrls = await extractImageUrls(productPageUrl);
  if (imageUrls.length === 0) {
    console.log(`  ⚠  No images found on product page`);
    return [];
  }
  console.log(`  Found ${imageUrls.length} image(s)`);

  const tmpDir = `/tmp/vc-images/${slug}`;
  mkdirSync(tmpDir, { recursive: true });

  const uploaded: Array<{ url: string; caption: string; cloudinaryId: string }> = [];

  for (let i = 0; i < imageUrls.length; i++) {
    const imgUrl = imageUrls[i];
    const ext = extname(new URL(imgUrl).pathname) || '.jpg';
    const localFile = `${tmpDir}/img-${String(i + 1).padStart(2, '0')}${ext}`;

    process.stdout.write(`  [${i + 1}/${imageUrls.length}] download ... `);
    try {
      await downloadImage(imgUrl, localFile);
      process.stdout.write('upload ... ');
      const cld = await uploadToCloudinary(localFile);
      if (cld) {
        uploaded.push({ url: cld.url, caption: '', cloudinaryId: cld.cloudinaryId });
        console.log('✓');
      } else {
        console.log('upload failed');
      }
    } catch (err: any) {
      console.log(`download failed (${err.message})`);
    }
  }

  try { rmSync(tmpDir, { recursive: true }); } catch { /* ignore */ }

  return uploaded;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Configure Cloudinary here — after env vars are loaded above
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key:    process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error('ERROR: CLOUDINARY_CLOUD_NAME is not set in .env.local');
    process.exit(1);
  }

  console.log('\nConnecting to MongoDB...');
  await mongoose.connect(MONGODB_URI!);
  console.log('Connected.\n');

  const products = await ProductModel.find({}, { slug: 1, name: 1 }).lean();
  console.log(`Processing ${products.length} products...\n`);

  let withImages = 0;
  let priceOnly  = 0;

  for (const product of products) {
    const images = await fetchAndUploadImages(product.slug, product.name);
    const price  = randomPrice();

    const update: Record<string, unknown> = { price };
    if (images.length > 0) update.images = images;

    await ProductModel.findOneAndUpdate({ slug: product.slug }, { $set: update });

    const fmt = price.toLocaleString('en-IN');
    if (images.length > 0) {
      console.log(`  ✓ ${images.length} image(s) uploaded, price set to ₹${fmt}`);
      withImages++;
    } else {
      console.log(`  ✓ Price set to ₹${fmt} (no images)`);
      priceOnly++;
    }

    await sleep(REQUEST_DELAY);
  }

  console.log('\n══════════════════════════════════════════');
  console.log(`Done.`);
  console.log(`  Products with images : ${withImages}`);
  console.log(`  Price-only updates   : ${priceOnly}`);
  console.log(`  Total                : ${withImages + priceOnly}`);
  console.log('══════════════════════════════════════════\n');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
