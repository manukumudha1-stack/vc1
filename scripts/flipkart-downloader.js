/**
 * Flipkart Product Image Downloader
 * Usage: node scripts/flipkart-downloader.js <flipkart-product-url>
 * Example: node scripts/flipkart-downloader.js "https://www.flipkart.com/saree/p/itm123"
 *
 * Images are saved to: assets/<product-slug>/product-image-01.jpg ...
 */

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { URL } = require("url");

const FLIPKART_URL = process.argv[2];

if (!FLIPKART_URL) {
  console.error("Usage: node scripts/flipkart-downloader.js <flipkart-product-url>");
  process.exit(1);
}

// Derive a folder name from the product slug in the Flipkart URL
// e.g. https://www.flipkart.com/kanjivaram-silk-saree/p/itm123 → "kanjivaram-silk-saree"
function folderNameFromUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const slug = segments[0] || "product";
    return slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 60);
  } catch {
    return "product-" + Date.now();
  }
}

const ASSETS_ROOT = path.join(__dirname, "..", "assets");
const OUTPUT_DIR = path.join(ASSETS_ROOT, folderNameFromUrl(FLIPKART_URL));

// Flipkart serves low-res thumbnails by default; upgrade to full resolution
function upgradeToFullRes(url) {
  return url
    .replace(/\/{w}x{h}-/gi, "/")
    .replace(/\/\d+x\d+-/g, "/")
    .replace(/\/\d+\/\d+\//g, "/832/832/")
    .replace(/q=\d+/, "q=90");
}

function extractProductImageUrls($) {
  const seen = new Set();
  const urls = [];

  const selectors = [
    "img._396cs4",
    "img._2r_T1I",
    "img.q6DClP",
    "img[src*='rukminim']",
  ];

  selectors.forEach((sel) => {
    $(sel).each((_, el) => {
      const raw = $(el).attr("src") || $(el).attr("data-src") || "";
      if (!raw || raw.startsWith("data:")) return;
      const full = upgradeToFullRes(raw);
      if (!seen.has(full)) {
        seen.add(full);
        urls.push(full);
      }
    });
  });

  return urls;
}

async function downloadImage(imageUrl, destPath) {
  const proto = imageUrl.startsWith("https") ? https : http;
  return new Promise((resolve, reject) => {
    proto.get(imageUrl, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
      file.on("error", reject);
    }).on("error", reject);
  });
}

async function main() {
  console.log(`\nFetching: ${FLIPKART_URL}`);

  let html;
  try {
    const { data } = await axios.get(FLIPKART_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.flipkart.com/",
      },
      timeout: 15000,
    });
    html = data;
  } catch (err) {
    console.error("Failed to fetch page:", err.message);
    process.exit(1);
  }

  const $ = cheerio.load(html);
  const imageUrls = extractProductImageUrls($);

  if (imageUrls.length === 0) {
    console.warn(
      "No product images found. Flipkart may have changed their markup.\n" +
      "Check the <img> class names in your browser and update the selectors array."
    );
    process.exit(0);
  }

  console.log(`Found ${imageUrls.length} image(s) — saving to: assets/${path.basename(OUTPUT_DIR)}/`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let downloaded = 0;
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    const ext = path.extname(new URL(url).pathname) || ".jpg";
    const filename = `product-image-${String(i + 1).padStart(2, "0")}${ext}`;
    const destPath = path.join(OUTPUT_DIR, filename);

    process.stdout.write(`  ${filename} ... `);
    try {
      await downloadImage(url, destPath);
      console.log("done");
      downloaded++;
    } catch (err) {
      console.log(`failed (${err.message})`);
    }
  }

  console.log(`\nDone: ${downloaded}/${imageUrls.length} images saved to ${OUTPUT_DIR}\n`);
}

main();
