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

// Because this runs via tsx from scripts/, use relative paths
import CollectionModel from '../lib/models/Collection';
import ProductModel from '../lib/models/Product';
import ServiceablePincodeModel from '../lib/models/ServiceablePincode';
import AdminModel from '../lib/models/Admin';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not set. Create .env.local with MONGODB_URI=...');
  process.exit(1);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function seed() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI as string, { bufferCommands: false });
  console.log('Connected.');

  // ── Remove legacy collections (replaced by Ilkal/Paithani/Gadwal/Mix Silk) ──
  const legacySlugs = ['bridal-kanjivaram', 'mysore-crepe', 'chettinad-cotton-silk', 'pochampally-ikat'];
  const legacyCollections = await CollectionModel.find({ slug: { $in: legacySlugs } }).lean();
  for (const lc of legacyCollections) {
    await ProductModel.deleteMany({ collectionId: lc._id });
    await CollectionModel.deleteOne({ _id: lc._id });
    console.log(`  Removed legacy collection: ${lc.name}`);
  }

  // ── Remove any products whose SKU is not in the canonical seed set ──────────
  const canonicalSKUs = [
    'VC-ILK-0101', 'VC-ILK-0102', 'VC-ILK-0103',
    'VC-PAI-0101', 'VC-PAI-0102', 'VC-PAI-0103',
    'VC-GAD-0101', 'VC-GAD-0102',
    'VC-CHET-0061', 'VC-POCH-0044', 'VC-MYS-0090',
  ];
  const orphanResult = await ProductModel.deleteMany({ sku: { $nin: canonicalSKUs } });
  if (orphanResult.deletedCount > 0) {
    console.log(`  Removed ${orphanResult.deletedCount} orphan product(s)`);
  }

  // ── Collections ──────────────────────────────────────────────
  const collectionsData = [
    {
      name: 'Ilkal Silk',
      slug: 'ilkal-silk',
      description: 'Handwoven pure silk sarees from Ilkal, Karnataka — distinguished by the tope teni pallu and kasuti embroidery. A GI-tagged heritage of North Karnataka.',
      coverImageUrl: 'https://picsum.photos/seed/ilkal-silk-cover/600/800',
      sortOrder: 1,
    },
    {
      name: 'Paithani Silk',
      slug: 'paithani-silk',
      description: 'Opulent Paithani silks from Paithan, Maharashtra — woven with real zari in peacock and lotus motifs. One of India\'s most celebrated bridal weaves.',
      coverImageUrl: 'https://picsum.photos/seed/paithani-silk-cover/600/800',
      sortOrder: 2,
    },
    {
      name: 'Gadwal Silk',
      slug: 'gadwal-silk',
      description: 'Pure silk Gadwal sarees from Gadwal, Telangana — known for their cotton body, pure silk pallu, and zari borders. A GI-tagged Deccan heritage weave.',
      coverImageUrl: 'https://picsum.photos/seed/gadwal-silk-cover/600/800',
      sortOrder: 3,
    },
    {
      name: 'Mix Silk',
      slug: 'mix-silk',
      description: 'Curated blends of silk and cotton — ikat, crepe, and check weaves from master weavers across Karnataka, Telangana, and Maharashtra.',
      coverImageUrl: 'https://picsum.photos/seed/mix-silk-cover/600/800',
      sortOrder: 4,
    },
  ];

  const collectionDocs: Record<string, mongoose.Types.ObjectId> = {};
  for (const c of collectionsData) {
    const doc = await CollectionModel.findOneAndUpdate(
      { slug: c.slug },
      { $set: c },
      { upsert: true, new: true }
    );
    collectionDocs[c.slug] = doc._id;
    console.log(`  Collection: ${c.name}`);
  }

  // ── Products ──────────────────────────────────────────────────
  // Images use picsum.photos with a fixed seed so each product always gets
  // the same consistent placeholder photo set for testing.
  const productsData = [
    // ── Ilkal Silk ────────────────────────────────────────────────
    {
      name: 'Ilkal Kasuti Border Silk',
      sku: 'VC-ILK-0101',
      collectionSlug: 'ilkal-silk',
      fabric: 'Pure Mulberry Silk',
      region: 'Ilkal, Bagalkot District, Karnataka',
      zariType: 'Silver Zari',
      occasion: ['Wedding', 'Festival'],
      price: 38500,
      stockQty: 2,
      blousePiece: 'included' as const,
      weaver: 'Ilkal Weavers Cooperative Society',
      description: 'A treasured example of Ilkal\'s GI-tagged craft — a cream silk body grounded by the iconic tope teni (joined pallu) technique. The six-inch silver zari pallu is framed by a kasuti hand-embroidered border running the full length of the saree, featuring the traditional menthi flower and negi running-stitch motifs in deep crimson thread.',
      story: 'Ilkal sarees have been woven in the Bagalkot district of northern Karnataka for over five centuries. The tope teni technique — where the pallu is woven separately on a different loom and then joined to the body using an interlocking thread — is unique to Ilkal and cannot be replicated on a power loom. The kasuti embroidery on the border is worked entirely by hand, stitch by stitch, by women artisans in weavers\' households. This particular weave took two weavers eleven days to complete.',
      careInstructions: 'Dry clean only. Wrap in soft muslin cloth for storage. Keep in a cool, dry place away from direct sunlight. Unfold and refold along different lines every six months to prevent crease marks.',
      images: [
        { url: 'https://picsum.photos/seed/vc-ilk-0101-a/480/640', caption: 'Full saree drape — tope teni pallu' },
        { url: 'https://picsum.photos/seed/vc-ilk-0101-b/480/640', caption: 'Kasuti hand-embroidered border detail' },
        { url: 'https://picsum.photos/seed/vc-ilk-0101-c/480/640', caption: 'Silver zari pallu close-up' },
        { url: 'https://picsum.photos/seed/vc-ilk-0101-d/480/640', caption: 'Body weave texture' },
      ],
    },
    {
      name: 'Crimson Ilkal Bridal Saree',
      sku: 'VC-ILK-0102',
      collectionSlug: 'ilkal-silk',
      fabric: 'Pure Mulberry Silk',
      region: 'Ilkal, Bagalkot District, Karnataka',
      zariType: 'Pure Gold Zari',
      occasion: ['Wedding'],
      price: 56800,
      stockQty: 1,
      blousePiece: 'included' as const,
      weaver: 'Ilakal Handloom House',
      description: 'A resplendent bridal Ilkal in deep crimson — the colour of auspiciousness in Karnataka weddings. The dense eight-inch pure gold zari pallu carries the traditional chikki paranda interlocking chain motif, and the body is woven in a fine 2×2 silk twill that catches light like polished garnet. The contrast-woven border uses a three-shuttle technique to create alternating green and gold bands.',
      story: 'The chikki paranda border takes its name from the paranda — a decorative tassel worn in the hair by brides in northern Karnataka. To replicate this in weave, the master weaver uses a supplementary weft technique on a traditional pit loom, introducing a third shuttle that carries the zari thread at precisely timed intervals. A single six-yard piece with this border demands three full days of uninterrupted weaving. This saree was handwoven by Krishnappa Biradar, a National Award-winning weaver from Ilkal.',
      careInstructions: 'Dry clean only. Store in original acid-free tissue packaging with silica gel packets. Do not store in plastic. Air the saree for two hours in shade before first wear.',
      images: [
        { url: 'https://picsum.photos/seed/vc-ilk-0102-a/480/640', caption: 'Full bridal drape — deep crimson' },
        { url: 'https://picsum.photos/seed/vc-ilk-0102-b/480/640', caption: 'Chikki paranda gold zari border' },
        { url: 'https://picsum.photos/seed/vc-ilk-0102-c/480/640', caption: 'Pallu — 8-inch pure zari field' },
        { url: 'https://picsum.photos/seed/vc-ilk-0102-d/480/640', caption: 'Body twill weave in crimson' },
      ],
    },
    {
      name: 'Ivory Ilkal Festival Silk',
      sku: 'VC-ILK-0103',
      collectionSlug: 'ilkal-silk',
      fabric: 'Pure Mulberry Silk',
      region: 'Ilkal, Bagalkot District, Karnataka',
      zariType: 'Gold Zari',
      occasion: ['Festival', 'Party'],
      price: 42000,
      stockQty: 2,
      blousePiece: 'included' as const,
      weaver: 'Ilkal Weavers Cooperative Society',
      description: 'The classic Ilkal silhouette in its most timeless form — a pure ivory silk body offset by a wide gold zari tope teni pallu in contrasting peacock green. The body carries a subtle self-stripe in satin weave and the border features a running negi stitch in gold. The blouse piece is in matching ivory with a single green and gold stripe at the hem.',
      story: 'Ivory Ilkals hold a special place in Karnataka\'s gift-giving tradition. They are the saree of choice for Dasara, Ugadi, and Ganesh Chaturthi celebrations, and are traditionally gifted by mothers-in-law to daughters-in-law on the first festival after marriage. The raw silk used in this piece was sourced from Karnataka sericulture farms in Ramanagara — India\'s largest silk-producing district — ensuring the thread quality that gives Ilkal its distinctive tight drape.',
      careInstructions: 'Dry clean only. Avoid contact with perfume, deodorant, and cosmetics. Store separately from coloured sarees to prevent dye transfer. Iron at medium heat on the reverse side only.',
      images: [
        { url: 'https://picsum.photos/seed/vc-ilk-0103-a/480/640', caption: 'Ivory body with contrast green pallu' },
        { url: 'https://picsum.photos/seed/vc-ilk-0103-b/480/640', caption: 'Tope teni join detail' },
        { url: 'https://picsum.photos/seed/vc-ilk-0103-c/480/640', caption: 'Gold zari border running stitch' },
        { url: 'https://picsum.photos/seed/vc-ilk-0103-d/480/640', caption: 'Matching blouse piece' },
      ],
    },
    // ── Paithani Silk ─────────────────────────────────────────────
    {
      name: 'Golden Paithani Peacock Saree',
      sku: 'VC-PAI-0101',
      collectionSlug: 'paithani-silk',
      fabric: 'Pure Mulberry Silk',
      region: 'Paithan, Aurangabad District, Maharashtra',
      zariType: 'Pure Zari',
      occasion: ['Wedding', 'Festival'],
      price: 68500,
      stockQty: 1,
      blousePiece: 'included' as const,
      weaver: 'Yeola Paithani Kendra',
      description: 'An exquisite Paithani in deep marigold gold — the colour most associated with Maharashtra\'s bridal tradition. The pallu features eleven rows of hand-woven dancing mor (peacock) motifs in parrot green, each with an individually woven fan-tail carrying four hundred thread intersections per square inch. The six-inch border is dense nauvari-style pure zari with a lotus-chain running pattern. The body carries a featherlight asawali (flowering vine) buti in silk on silk.',
      story: 'Paithani silk has been woven in the ancient town of Paithan on the banks of the Godavari for over two thousand years. The weaving technique is a form of tapestry: unlike most sarees where the design is created by floating threads, in Paithani each colour block is individually woven using a separate shuttle — a technique called the interlocking weft method. A single dancing peacock motif requires a weaver to manipulate up to twenty shuttles simultaneously. This piece was woven by the Salunkhe family of Yeola, a weaving centre near Nashik known for preserving the most ornate Paithani traditions.',
      careInstructions: 'Dry clean only. Store folded in soft muslin cloth — never on a hanger, as the weight of the zari can distort the fabric. Keep silica gel in the storage box. Unfold and air every three months.',
      images: [
        { url: 'https://picsum.photos/seed/vc-pai-0101-a/480/640', caption: 'Full drape — marigold gold with peacock pallu' },
        { url: 'https://picsum.photos/seed/vc-pai-0101-b/480/640', caption: 'Dancing mor (peacock) pallu motifs' },
        { url: 'https://picsum.photos/seed/vc-pai-0101-c/480/640', caption: 'Pure zari lotus-chain border' },
        { url: 'https://picsum.photos/seed/vc-pai-0101-d/480/640', caption: 'Asawali buti on body silk' },
      ],
    },
    {
      name: 'Lotus Paithani Wedding Silk',
      sku: 'VC-PAI-0102',
      collectionSlug: 'paithani-silk',
      fabric: 'Pure Mulberry Silk',
      region: 'Paithan, Aurangabad District, Maharashtra',
      zariType: 'Pure Zari',
      occasion: ['Wedding'],
      price: 92000,
      stockQty: 1,
      blousePiece: 'included' as const,
      weaver: 'Paithan Silk Weavers Cooperative',
      description: 'A commission-grade heirloom Paithani in deep wine red — among the rarest body colours in the tradition. The full pallu is a field of sixteen large open padma (lotus) rosettes in champagne and silver, each petal individually woven in the interlocking tapestry method. The border carries a double-row pure zari lotus chain and padam creeper. The body has a fine diagonal self-stripe in satin and plain weave alternation, with a scattered mango buti in pure zari throughout. Delivered with a certificate of authenticity and silk-mark certification.',
      story: 'This piece replicates the patterns found in 18th-century Peshwa-era Paithani specimens held in the Deccan heritage archives of Aurangabad. The Peshwa court at Pune was among the greatest patrons of Paithani weaving, and the lotus pallu was the mark of the highest court rank. Lotus motifs in this scale — each 14 cm across — require four to five hours of weaving per motif. This six-yard saree took a team of two master weavers from the Paithan Silk Weavers Cooperative four and a half months to complete on a traditional throw-shuttle pit loom.',
      careInstructions: 'Dry clean only. Store in original acid-free tissue packaging. Keep away from moisture and strong light. This saree contains real gold and silver zari — insure before transport.',
      images: [
        { url: 'https://picsum.photos/seed/vc-pai-0102-a/480/640', caption: 'Full drape — deep wine red' },
        { url: 'https://picsum.photos/seed/vc-pai-0102-b/480/640', caption: 'Full pallu — 16 lotus rosettes in champagne' },
        { url: 'https://picsum.photos/seed/vc-pai-0102-c/480/640', caption: 'Border — double-row lotus chain' },
        { url: 'https://picsum.photos/seed/vc-pai-0102-d/480/640', caption: 'Mango buti on body' },
      ],
    },
    {
      name: 'Peacock Blue Paithani Silk',
      sku: 'VC-PAI-0103',
      collectionSlug: 'paithani-silk',
      fabric: 'Pure Mulberry Silk',
      region: 'Paithan, Aurangabad District, Maharashtra',
      zariType: 'Gold Zari',
      occasion: ['Festival', 'Party'],
      price: 54000,
      stockQty: 2,
      blousePiece: 'included' as const,
      weaver: 'Yeola Paithani Kendra',
      description: 'A vibrant Paithani in the deep indigo-teal most prized by Maharashtrian women for festive occasions — known locally as "mor neela" (peacock blue). The pallu carries a double row of mor motifs in orange and gold, and the six-inch border is a classic asawali flowering-vine pattern in dense gold zari. Scattered mango buti motifs dot the body at regular intervals. A perfect festival saree that transitions effortlessly from day to evening.',
      story: 'The deep peacock blue of this Paithani comes from natural indigo extracted from plants grown in the Godavari river basin in Maharashtra — a dyeing tradition kept alive by a single family of khatri (dyer) artisans in Paithan who have practised the craft for nine generations. Natural indigo produces a depth and warmth of colour that synthetic dyes cannot replicate — the blue shifts from turquoise in sunlight to a deep teal in indoor light. The colour is fixed with alum and iron mordants, making it colourfast without harming the silk fibre.',
      careInstructions: 'Dry clean only. The first dry clean may lighten the colour slightly — this is normal with natural indigo. Do not use enzyme-based detergents. Store folded in muslin.',
      images: [
        { url: 'https://picsum.photos/seed/vc-pai-0103-a/480/640', caption: 'Full drape — mor neela (peacock blue)' },
        { url: 'https://picsum.photos/seed/vc-pai-0103-b/480/640', caption: 'Pallu — double row mor motifs in orange and gold' },
        { url: 'https://picsum.photos/seed/vc-pai-0103-c/480/640', caption: 'Asawali gold zari border' },
        { url: 'https://picsum.photos/seed/vc-pai-0103-d/480/640', caption: 'Body — mango buti scatter' },
      ],
    },
    // ── Gadwal Silk ───────────────────────────────────────────────
    {
      name: 'Gadwal Zari Pattu Saree',
      sku: 'VC-GAD-0101',
      collectionSlug: 'gadwal-silk',
      fabric: 'Cotton Body, Pure Silk Pallu',
      region: 'Gadwal, Mahabubnagar District, Telangana',
      zariType: 'Pure Zari',
      occasion: ['Wedding', 'Festival'],
      price: 34800,
      stockQty: 2,
      blousePiece: 'included' as const,
      weaver: 'Gadwal Weavers Cooperative',
      description: 'An authentic GI-tagged Gadwal pattu in turmeric yellow — one of Gadwal\'s traditional body colours. The cotton body is woven in a fine 100×100 thread count and carries a subtle self-check pattern, while the pure silk pallu unfolds into a field of gold zari temple-tower (gopuram) border motifs. The korvai technique joins body and pallu at the loom using an interlocking weft, so the join is virtually invisible. The contrast border runs on both sides in deep maroon with a gold zari stripe.',
      story: 'Gadwal\'s defining innovation — joining a lightweight cotton body to a rich silk pallu at the loom itself — was developed to suit the hot Deccan plateau climate. A full silk saree is too heavy for everyday wear in Telangana\'s heat, but a cotton saree lacks the ceremonial weight for weddings and temple occasions. Gadwal solved this by creating two separate pieces on two looms and joining them using the korvai interlocking technique — a process so precise that only a master weaver can execute it cleanly. Gadwal received its GI tag in 2004 in recognition of this unique technique.',
      careInstructions: 'Dry clean only for the silk pallu. The cotton body can be hand-washed with mild soap but must be dried flat and pressed while damp. Store with the pallu folded inward.',
      images: [
        { url: 'https://picsum.photos/seed/vc-gad-0101-a/480/640', caption: 'Full drape — turmeric body, gold silk pallu' },
        { url: 'https://picsum.photos/seed/vc-gad-0101-b/480/640', caption: 'Korvai join — where cotton meets silk' },
        { url: 'https://picsum.photos/seed/vc-gad-0101-c/480/640', caption: 'Gopuram temple-border in pure zari' },
        { url: 'https://picsum.photos/seed/vc-gad-0101-d/480/640', caption: 'Cotton body self-check weave' },
      ],
    },
    {
      name: 'Temple Border Gadwal Silk',
      sku: 'VC-GAD-0102',
      collectionSlug: 'gadwal-silk',
      fabric: 'Cotton Body, Pure Silk Pallu',
      region: 'Gadwal, Mahabubnagar District, Telangana',
      zariType: 'Pure Zari',
      occasion: ['Wedding', 'Festival'],
      price: 42000,
      stockQty: 1,
      blousePiece: 'included' as const,
      weaver: 'Sompeta Handlooms',
      description: 'A regal flame-red Gadwal saree in the classic bridal colour of Telangana. The cotton body carries a dense woven check in red and maroon, and the pure silk pallu features an elaborate gold zari gopuram (temple tower) border — four rows of tiered towers separated by running creeper vines in silver zari. The wide border on both sides is a deep maroon with pure gold zari stripes. The blouse piece is in matching flame-red silk with a gold border stripe.',
      story: 'The gopuram motif in Gadwal saree borders traces directly to the royal patronage of the Wanaparthy zamindari family, who commissioned these sarees from Gadwal weavers for temple festival processions in the 19th century. The motif depicts the towered gateway of a South Indian temple — a symbol of auspiciousness and divine protection. The Sompeta family of weavers has been weaving this specific gopuram pattern for four generations, preserving the exact sequence of shuttle passes that creates the three-dimensional effect of the tower tiers.',
      careInstructions: 'Dry clean only. Store with the silk pallu folded inward against the cotton body. Keep in an airtight box with silica gel. Press only the cotton section; the silk pallu should be steamed, not ironed.',
      images: [
        { url: 'https://picsum.photos/seed/vc-gad-0102-a/480/640', caption: 'Full bridal drape — flame red' },
        { url: 'https://picsum.photos/seed/vc-gad-0102-b/480/640', caption: 'Gopuram border — four rows of temple towers' },
        { url: 'https://picsum.photos/seed/vc-gad-0102-c/480/640', caption: 'Silk pallu detail — gold on red' },
        { url: 'https://picsum.photos/seed/vc-gad-0102-d/480/640', caption: 'Cotton body woven check' },
      ],
    },
    // ── Mix Silk ──────────────────────────────────────────────────
    {
      name: 'Kandangi Earth-Check Weave',
      sku: 'VC-CHET-0061',
      collectionSlug: 'mix-silk',
      fabric: 'Cotton Silk',
      region: 'Karaikudi, Sivaganga District, Tamil Nadu',
      zariType: 'Copper Zari',
      occasion: ['Daily Wear', 'Festival'],
      price: 14200,
      stockQty: 50,
      blousePiece: 'not_included' as const,
      weaver: 'Karaikudi Handlooms',
      description: 'A relaxed daily-wear saree in the classic Kandangi large-check pattern — earthy terracotta and ecru checks woven in a soft cotton-silk blend with a copper zari line at each check border. The body is light enough for all-day wear while the copper zari gives it a quiet shimmer suited for festivals. The self-woven border in terracotta and copper is two inches wide. The saree drapes effortlessly and requires no pleating tricks.',
      story: 'Kandangi is a village near Karaikudi in the Sivaganga district of Tamil Nadu — the heartland of the Chettinad region. The Chettinad check saree takes its name from here and was originally woven for the women of the Nattukotai Chettiars, a mercantile community whose elaborate mansions and rich textile tradition define the region. The large bold check is distinctive to Kandangi — most Chettinad sarees use a smaller check — and the copper zari border is a regional signature not found in check sarees from other weaving centres.',
      careInstructions: 'Machine wash on gentle cycle in a mesh laundry bag with cold water. Or hand wash with mild detergent. Do not tumble dry. Iron damp at medium heat. Copper zari should not be soaked for long periods.',
      images: [
        { url: 'https://picsum.photos/seed/vc-chet-0061-a/480/640', caption: 'Full drape — terracotta and ecru check' },
        { url: 'https://picsum.photos/seed/vc-chet-0061-b/480/640', caption: 'Kandangi large check pattern close-up' },
        { url: 'https://picsum.photos/seed/vc-chet-0061-c/480/640', caption: 'Copper zari border detail' },
        { url: 'https://picsum.photos/seed/vc-chet-0061-d/480/640', caption: 'Cotton-silk blend texture' },
      ],
    },
    {
      name: 'Pochampally Double Ikat Saree',
      sku: 'VC-POCH-0044',
      collectionSlug: 'mix-silk',
      fabric: 'Pure Silk',
      region: 'Bhoodan Pochampally, Nalgonda District, Telangana',
      zariType: 'No Zari',
      occasion: ['Daily Wear', 'Office', 'Festival'],
      price: 31750,
      stockQty: 2,
      blousePiece: 'on_request' as const,
      weaver: 'Pochampally Weavers Cooperative',
      description: 'A masterwork of the double ikat technique — deep indigo and off-white geometric diamond patterns that emerge from a resist-dyeing process that pre-dates the weaving itself. The saree has no zari, letting the sharpness of the ikat geometry carry the visual weight. The body is a continuous field of interconnected diamonds with a fine chevron border, and the pallu intensifies the pattern into a dense diamond grid. A UNESCO-recognised craft and GI-tagged heritage product.',
      story: 'Pochampally is the only weaving centre in India that produces double ikat — a technique where both the warp threads and the weft threads are resist-dyed before weaving to create a pattern that must align perfectly when the cloth is woven. A misalignment of even a single thread ruins the pattern. The dyeing alone for a double ikat saree takes three to four weeks; the weaving takes another two to three weeks. Single ikat (dyeing only the warp) is common across the world, but double ikat is found only in three locations globally: Pochampally in India, Patan in Gujarat (Patola), and Tenganan in Bali.',
      careInstructions: 'Dry clean recommended. If hand-washing, use cold water and mild soap — the first wash may bleed slightly; rinse until the water runs clear. Do not wring or tumble dry. Store flat or rolled.',
      images: [
        { url: 'https://picsum.photos/seed/vc-poch-0044-a/480/640', caption: 'Full drape — indigo double ikat' },
        { url: 'https://picsum.photos/seed/vc-poch-0044-b/480/640', caption: 'Diamond ikat pattern close-up' },
        { url: 'https://picsum.photos/seed/vc-poch-0044-c/480/640', caption: 'Pallu — dense diamond grid' },
        { url: 'https://picsum.photos/seed/vc-poch-0044-d/480/640', caption: 'Chevron border detail' },
      ],
    },
    {
      name: 'Champagne Mysore Silk Crepe',
      sku: 'VC-MYS-0090',
      collectionSlug: 'mix-silk',
      fabric: 'Mysore Silk Crepe',
      region: 'Mysuru, Karnataka',
      zariType: 'Silver Zari',
      occasion: ['Office', 'Daily Wear'],
      price: 22900,
      stockQty: 3,
      blousePiece: 'included' as const,
      weaver: 'Karnataka Silk Industries Corporation',
      description: 'Effortless everyday elegance in a whisper-light champagne crepe — the saree equivalent of a white shirt. The fabric has the characteristic Mysore silk crepe texture: slightly crinkled with a soft matte finish that drapes in smooth, fluid folds. The four-inch silver zari border is clean and unadorned, letting the champagne lustre of the silk do the work. The blouse piece is matching crepe with a double silver stripe.',
      story: 'Mysore Silk is one of only two silk varieties in India (along with Kanjivaram) to carry both a GI tag and the Silk Mark certification — the Indian government\'s quality assurance label for pure silk. The Karnataka Silk Industries Corporation (KSIC), established in 1912, is the only government enterprise authorised to weave and sell genuine Mysore Silk. Every metre woven at KSIC carries a holographic Silk Mark tag. The crepe variant uses a twisted warp thread that creates the characteristic crepe texture — unlike smooth Mysore silk, the crepe holds its shape even without a petticoat.',
      careInstructions: 'Hand wash with mild silk-specific shampoo in cold water. Do not rub — gently squeeze out water. Dry flat in shade. Iron on low heat on the reverse side. Do not dry clean if avoidable; crepe texture is best preserved by careful hand washing.',
      images: [
        { url: 'https://picsum.photos/seed/vc-mys-0090-a/480/640', caption: 'Full drape — champagne crepe' },
        { url: 'https://picsum.photos/seed/vc-mys-0090-b/480/640', caption: 'Crepe texture close-up' },
        { url: 'https://picsum.photos/seed/vc-mys-0090-c/480/640', caption: 'Silver zari border detail' },
        { url: 'https://picsum.photos/seed/vc-mys-0090-d/480/640', caption: 'Blouse piece with double silver stripe' },
      ],
    },
  ];

  for (const p of productsData) {
    const { collectionSlug, ...rest } = p;
    const collectionId = collectionDocs[collectionSlug];
    if (!collectionId) {
      console.warn(`  WARN: Collection not found for slug "${collectionSlug}", skipping "${p.name}"`);
      continue;
    }
    await ProductModel.findOneAndUpdate(
      { sku: p.sku },
      {
        $set: {
          ...rest,
          slug: slugify(p.name),
          collectionId,
        },
      },
      { upsert: true, new: true }
    );
    console.log(`  Product: ${p.name} (${p.sku})`);
  }

  // ── Serviceable Pincodes ──────────────────────────────────────
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
    console.log(`  Pincode: ${pin.pincode} (${pin.city}, ${pin.deliveryDays}d)`);
  }

  // ── Admin User ────────────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('  WARN: SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD not set — skipping admin seed.');
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await AdminModel.findOneAndUpdate(
      { email: adminEmail.toLowerCase() },
      { $set: { email: adminEmail.toLowerCase(), passwordHash, role: 'super' } },
      { upsert: true, new: true }
    );
    console.log(`  Admin: ${adminEmail}`);
  }

  // ── Summary ───────────────────────────────────────────────────
  const [colCount, prodCount, pinCount, adminCount] = await Promise.all([
    CollectionModel.countDocuments(),
    ProductModel.countDocuments(),
    ServiceablePincodeModel.countDocuments(),
    AdminModel.countDocuments(),
  ]);

  console.log('\n── Seed Complete ──────────────────────────────────');
  console.log(`  Collections : ${colCount}`);
  console.log(`  Products    : ${prodCount}`);
  console.log(`  Pincodes    : ${pinCount}`);
  console.log(`  Admins      : ${adminCount}`);
  console.log('───────────────────────────────────────────────────\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
