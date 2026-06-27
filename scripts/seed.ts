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

import CollectionModel         from '../lib/models/Collection';
import ProductModel            from '../lib/models/Product';
import UserModel               from '../lib/models/User';
import AdminModel              from '../lib/models/Admin';
import OrderModel              from '../lib/models/Order';
import LookbookModel           from '../lib/models/Lookbook';
import SiteConfigModel         from '../lib/models/SiteConfig';
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

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────────────────────────────────────

const COLLECTIONS = [
  {
    name: 'Ilkal Silk',
    slug: 'ilkal-silk',
    description: 'Handwoven pure silk sarees from Ilkal, Karnataka — distinguished by the tope teni pallu and kasuti embroidery. A GI-tagged heritage of North Karnataka.',
    coverImageUrl: '',
    sortOrder: 1,
  },
  {
    name: 'Paithani Silk',
    slug: 'paithani-silk',
    description: 'Opulent Paithani silks from Paithan, Maharashtra — woven with real zari in peacock and lotus motifs. One of India\'s most celebrated bridal weaves.',
    coverImageUrl: '',
    sortOrder: 2,
  },
  {
    name: 'Gadwal Silk',
    slug: 'gadwal-silk',
    description: 'Pure silk Gadwal sarees from Gadwal, Telangana — known for their cotton body, pure silk pallu, and zari borders. A GI-tagged Deccan heritage weave.',
    coverImageUrl: '',
    sortOrder: 3,
  },
  {
    name: 'Mix Silk',
    slug: 'mix-silk',
    description: 'Curated blends of silk and cotton — ikat, crepe, and check weaves from master weavers across Karnataka, Telangana, and Maharashtra.',
    coverImageUrl: '',
    sortOrder: 4,
  },
];

type BlousePiece = 'included' | 'not_included' | 'on_request';

interface ProductSeed {
  name: string;
  sku: string;
  collectionSlug: string;
  fabric: string;
  region: string;
  zariType: string;
  occasion: string[];
  price: number;
  stockQty: number;
  blousePiece: BlousePiece;
  weaver: string;
  isFeatured: boolean;
  description: string;
  story: string;
  careInstructions: string;
}

const PRODUCTS: ProductSeed[] = [

  // ── ILKAL SILK (10) ──────────────────────────────────────────────────────

  {
    name: 'Crimson Kasuti Border Ilkal',
    sku: 'VC-ILK-001',
    collectionSlug: 'ilkal-silk',
    fabric: 'Pure Mulberry Silk',
    region: 'Ilkal, Bagalkot District, Karnataka',
    zariType: 'Silver Zari',
    occasion: ['Wedding', 'Festival'],
    price: 38500,
    stockQty: 3,
    blousePiece: 'included',
    weaver: 'Ilkal Weavers Cooperative Society',
    isFeatured: true,
    description:
      'A resplendent bridal Ilkal in deep crimson — the colour of auspiciousness in Karnataka weddings. ' +
      'The six-inch silver zari tope teni pallu is bordered by hand-worked kasuti embroidery in the traditional menthi flower and negi stitch motifs. ' +
      'The silk body carries a fine 2×2 twill that catches light like polished garnet.',
    story:
      'Ilkal sarees have been woven in the Bagalkot district of northern Karnataka for over five centuries. ' +
      'The tope teni technique — where the pallu is woven separately and joined at the loom using an interlocking thread — is unique to Ilkal and cannot be replicated on a power loom. ' +
      'This piece took two weavers eleven days to complete.',
    careInstructions: 'Dry clean only. Store in soft muslin cloth, away from direct sunlight. Refold along different lines every six months to prevent permanent crease marks.',
  },
  {
    name: 'Ivory Tope Teni Festival Silk',
    sku: 'VC-ILK-002',
    collectionSlug: 'ilkal-silk',
    fabric: 'Pure Mulberry Silk',
    region: 'Ilkal, Bagalkot District, Karnataka',
    zariType: 'Gold Zari',
    occasion: ['Festival', 'Party'],
    price: 42000,
    stockQty: 4,
    blousePiece: 'included',
    weaver: 'Ilkal Weavers Cooperative Society',
    isFeatured: true,
    description:
      'The classic Ilkal silhouette in its most timeless form — a pure ivory silk body offset by a wide gold zari tope teni pallu in contrasting peacock green. ' +
      'The body carries a subtle self-stripe in satin weave and the border features a running negi stitch in gold. ' +
      'The blouse piece is matching ivory with a single green and gold stripe at the hem.',
    story:
      'Ivory Ilkals hold a special place in Karnataka\'s gift-giving tradition — the saree of choice for Dasara, Ugadi, and Ganesh Chaturthi. ' +
      'They are traditionally gifted by mothers-in-law to daughters-in-law on the first festival after marriage. ' +
      'The raw silk for this piece was sourced from Ramanagara, India\'s largest silk-producing district.',
    careInstructions: 'Dry clean only. Avoid contact with perfume and cosmetics. Store separately from coloured sarees to prevent dye transfer.',
  },
  {
    name: 'Peacock Green Bridal Ilkal',
    sku: 'VC-ILK-003',
    collectionSlug: 'ilkal-silk',
    fabric: 'Pure Mulberry Silk',
    region: 'Ilkal, Bagalkot District, Karnataka',
    zariType: 'Pure Gold Zari',
    occasion: ['Wedding'],
    price: 56800,
    stockQty: 2,
    blousePiece: 'included',
    weaver: 'Ilakal Handloom House',
    isFeatured: false,
    description:
      'A stunning bridal Ilkal in deep peacock green woven with an eight-inch pure gold zari chikki paranda pallu. ' +
      'The contrast crimson border uses a three-shuttle technique creating alternating bands of green, red, and gold. ' +
      'Rich in the ceremonial weight and stiffness that Ilkal brides have prized for generations.',
    story:
      'The chikki paranda border takes its name from the paranda — a decorative tassel worn by brides in northern Karnataka. ' +
      'Replicating this in weave requires a supplementary weft technique on a traditional pit loom, introducing a third shuttle at precisely timed intervals. ' +
      'This saree was woven by a third-generation weaver from Ilkal over twelve working days.',
    careInstructions: 'Dry clean only. Store in original acid-free tissue with silica gel packets. Air in shade for two hours before first wear.',
  },
  {
    name: 'Turmeric Negi Border Silk',
    sku: 'VC-ILK-004',
    collectionSlug: 'ilkal-silk',
    fabric: 'Pure Mulberry Silk',
    region: 'Ilkal, Bagalkot District, Karnataka',
    zariType: 'Silver Zari',
    occasion: ['Festival', 'Daily Wear'],
    price: 32000,
    stockQty: 5,
    blousePiece: 'included',
    weaver: 'Ilkal Weavers Cooperative Society',
    isFeatured: false,
    description:
      'A cheerful turmeric yellow Ilkal silk with a silver zari negi (running-stitch) border running the full length of the saree. ' +
      'The tope teni pallu is woven in deep maroon with a contrasting silver stripe, creating a vivid colour-block effect typical of North Karnataka festive dress. ' +
      'Light enough for all-day festival wear yet formal enough for temple occasions.',
    story:
      'Turmeric yellow — known locally as arishina — is the colour of new beginnings in Karnataka rituals and is worn at haldi ceremonies, naming ceremonies, and temple festivals. ' +
      'The negi running stitch pattern in the border is one of the oldest kasuti motifs, derived from the geometric patterns found on ancient Karnataka temple carvings.',
    careInstructions: 'Dry clean only. The turmeric shade can bleed onto lighter garments — store separately in muslin.',
  },
  {
    name: 'Navy Kasuti Weave Ilkal',
    sku: 'VC-ILK-005',
    collectionSlug: 'ilkal-silk',
    fabric: 'Pure Mulberry Silk',
    region: 'Ilkal, Bagalkot District, Karnataka',
    zariType: 'Gold Zari',
    occasion: ['Festival', 'Party'],
    price: 44500,
    stockQty: 3,
    blousePiece: 'included',
    weaver: 'Ilakal Handloom House',
    isFeatured: false,
    description:
      'A sophisticated deep navy Ilkal silk showcasing an intricate kasuti hand-embroidered border in gold and ivory thread. ' +
      'The tope teni pallu in contrasting ivory carries a six-inch dense gold zari field, and the self-stripe body in navy gives the saree a quiet, formal elegance. ' +
      'A striking choice for evening festivities and award ceremonies.',
    story:
      'Navy blue entered the Ilkal palette through the influence of the Nizam\'s court trade routes in the 18th century, when natural indigo from Andhra was traded for silk from Karnataka. ' +
      'The gold kasuti embroidery on navy is now considered one of Ilkal\'s most prestigious colour combinations.',
    careInstructions: 'Dry clean only. Natural indigo may transfer slightly in the first wash — handle with care in the first season.',
  },
  {
    name: 'Deep Purple Bridal Ilkal Silk',
    sku: 'VC-ILK-006',
    collectionSlug: 'ilkal-silk',
    fabric: 'Pure Mulberry Silk',
    region: 'Ilkal, Bagalkot District, Karnataka',
    zariType: 'Pure Gold Zari',
    occasion: ['Wedding', 'Festival'],
    price: 58000,
    stockQty: 2,
    blousePiece: 'included',
    weaver: 'Bagalkot Silk Weavers Guild',
    isFeatured: false,
    description:
      'A regal deep purple Ilkal silk crafted for the modern bride who seeks drama over convention. ' +
      'The eight-inch pure gold zari pallu features the traditional elephant procession motif — a symbol of Karnataka royalty — woven in the supplementary weft technique. ' +
      'The contrast border in gold and orange completes the ceremonial grandeur.',
    story:
      'Purple sarees from Ilkal gained prominence during the Mysore Maharaja era when weavers were commissioned to create sarees in the royal colours. ' +
      'The elephant procession motif in the pallu is based on the Dasara Jamboo Savari procession and has been woven in Ilkal for over three generations.',
    careInstructions: 'Dry clean only. Store wrapped in gold tissue paper with silica gel. Avoid strong artificial light to preserve the purple dye.',
  },
  {
    name: 'Rust Orange Festive Ilkal',
    sku: 'VC-ILK-007',
    collectionSlug: 'ilkal-silk',
    fabric: 'Pure Mulberry Silk',
    region: 'Ilkal, Bagalkot District, Karnataka',
    zariType: 'Silver Zari',
    occasion: ['Festival', 'Party'],
    price: 36000,
    stockQty: 6,
    blousePiece: 'included',
    weaver: 'Ilkal Weavers Cooperative Society',
    isFeatured: false,
    description:
      'A vibrant rust orange Ilkal silk that glows like sunset in natural light. ' +
      'The silver zari tope teni pallu in deep forest green creates a bold contrast beloved in Karnataka\'s Uttara Kannada region. ' +
      'The kasuti border features the traditional pagoda stitch in ivory and silver thread.',
    story:
      'Rust orange — known as kempu naringe — is associated with the harvest season in Karnataka and is the preferred colour for Sankranti and Ugadi celebrations. ' +
      'The silver-on-green pallu combination is a signature of the Dharwad belt of Ilkal weavers, distinct from the more common gold-on-red of Bagalkot weavers.',
    careInstructions: 'Dry clean only. The vibrant orange shade is fast but may fade slightly over many years — avoid prolonged exposure to sunlight.',
  },
  {
    name: 'Emerald Temple Border Ilkal',
    sku: 'VC-ILK-008',
    collectionSlug: 'ilkal-silk',
    fabric: 'Pure Mulberry Silk',
    region: 'Ilkal, Bagalkot District, Karnataka',
    zariType: 'Pure Gold Zari',
    occasion: ['Wedding', 'Festival'],
    price: 51000,
    stockQty: 2,
    blousePiece: 'included',
    weaver: 'Ilakal Handloom House',
    isFeatured: false,
    description:
      'A lush emerald green Ilkal silk with a wide pure gold zari temple border featuring the gopuram (temple tower) motif. ' +
      'The tope teni pallu unfolds into a field of dense gold against emerald, framed by a contrast maroon border with a gold zari stripe on each side. ' +
      'A saree of exceptional ceremonial weight, suited for religious occasions and wedding receptions.',
    story:
      'The temple border — known as gudi palla in Kannada — is one of Ilkal\'s oldest design traditions, rooted in the Chalukya-era temple architecture of Bagalkot. ' +
      'The gopuram motif is woven using a discontinuous supplementary weft, with each tower requiring a separate thread to complete its stepped silhouette.',
    careInstructions: 'Dry clean only. The gold zari is real and must be stored dry. Keep silica gel in the storage box at all times.',
  },
  {
    name: 'Rose Pink Ilkal Occasion Silk',
    sku: 'VC-ILK-009',
    collectionSlug: 'ilkal-silk',
    fabric: 'Pure Mulberry Silk',
    region: 'Ilkal, Bagalkot District, Karnataka',
    zariType: 'Gold Zari',
    occasion: ['Festival', 'Party'],
    price: 34000,
    stockQty: 5,
    blousePiece: 'included',
    weaver: 'Ilkal Weavers Cooperative Society',
    isFeatured: false,
    description:
      'A delicate rose pink Ilkal silk for women who love the kasuti tradition in softer tones. ' +
      'The gold zari tope teni pallu in contrast deep blue creates a striking colour pairing, and the kasuti border in the menthi flower stitch runs in gold and ivory thread along the full length. ' +
      'A popular choice for baby showers, namakaranas, and upanayana ceremonies.',
    story:
      'Rose pink entered the Ilkal palette in the mid-20th century when weavers in Ilkal began exploring pastel body colours to appeal to younger buyers. ' +
      'The contrast blue pallu against pink body — inspired by the pink-and-blue of the Krishna temples of Udupi — has since become a signature festival combination.',
    careInstructions: 'Dry clean only. Soft pinks may absorb perfume over time — apply perfume before draping, not on the saree.',
  },
  {
    name: 'Midnight Blue Kasuti Grand Silk',
    sku: 'VC-ILK-010',
    collectionSlug: 'ilkal-silk',
    fabric: 'Pure Mulberry Silk',
    region: 'Ilkal, Bagalkot District, Karnataka',
    zariType: 'Pure Gold Zari',
    occasion: ['Wedding', 'Party'],
    price: 62000,
    stockQty: 1,
    blousePiece: 'included',
    weaver: 'Bagalkot Silk Weavers Guild',
    isFeatured: false,
    description:
      'A grand midnight blue Ilkal silk with an expansive ten-inch pure gold zari pallu — one of the widest tope teni pallus crafted in Ilkal. ' +
      'The kasuti hand embroidery on the border features the elephant, peacock, and chariot motifs in a continuous processional frieze. ' +
      'Crafted for the woman who wants every inch of her saree to tell a story.',
    story:
      'This saree was inspired by the Karnataka Rajyotsava celebrations of Dharwad, where the weavers of the Bagalkot Silk Weavers Guild create a special series each year with extra-wide pallus as a mark of festive pride. ' +
      'The processional frieze border takes four days of embroidery alone, with each motif individually stitched by women artisans of the weavers\' household.',
    careInstructions: 'Dry clean only. This is a collector\'s piece — store in original acid-free tissue and insure before travel.',
  },

  // ── PAITHANI SILK (10) ──────────────────────────────────────────────────

  {
    name: 'Marigold Gold Peacock Paithani',
    sku: 'VC-PAI-001',
    collectionSlug: 'paithani-silk',
    fabric: 'Pure Mulberry Silk',
    region: 'Paithan, Aurangabad District, Maharashtra',
    zariType: 'Pure Zari',
    occasion: ['Wedding', 'Festival'],
    price: 68500,
    stockQty: 2,
    blousePiece: 'included',
    weaver: 'Yeola Paithani Kendra',
    isFeatured: true,
    description:
      'An exquisite Paithani in deep marigold gold — the colour most associated with Maharashtra\'s bridal tradition. ' +
      'The pallu features eleven rows of hand-woven dancing mor (peacock) motifs in parrot green, each with an individually woven fan-tail. ' +
      'The body carries a featherlight asawali (flowering vine) buti in silk on silk, with a six-inch pure zari border.',
    story:
      'Paithani silk has been woven in the ancient town of Paithan on the banks of the Godavari for over two thousand years. ' +
      'In Paithani, each colour block is individually woven using a separate shuttle — a technique called the interlocking weft. ' +
      'This piece was woven by the Salunkhe family of Yeola, preserving the most ornate Paithani traditions.',
    careInstructions: 'Dry clean only. Store folded in soft muslin — never on a hanger. Keep silica gel in the storage box. Unfold and air every three months.',
  },
  {
    name: 'Wine Red Lotus Wedding Paithani',
    sku: 'VC-PAI-002',
    collectionSlug: 'paithani-silk',
    fabric: 'Pure Mulberry Silk',
    region: 'Paithan, Aurangabad District, Maharashtra',
    zariType: 'Pure Zari',
    occasion: ['Wedding'],
    price: 92000,
    stockQty: 1,
    blousePiece: 'included',
    weaver: 'Paithan Silk Weavers Cooperative',
    isFeatured: true,
    description:
      'A commission-grade heirloom Paithani in deep wine red — among the rarest body colours in the tradition. ' +
      'The full pallu is a field of sixteen large open padma (lotus) rosettes in champagne and silver, each petal individually woven. ' +
      'The body has a fine diagonal self-stripe with a scattered mango buti in pure zari. Delivered with Silk Mark certification.',
    story:
      'This piece replicates the patterns found in 18th-century Peshwa-era Paithani specimens. ' +
      'The Peshwa court at Pune was among the greatest patrons of Paithani weaving, and the lotus pallu was the mark of highest court rank. ' +
      'This six-yard saree took a team of two master weavers four and a half months to complete.',
    careInstructions: 'Dry clean only. This saree contains real gold and silver zari — insure before transport. Store in original acid-free tissue packaging.',
  },
  {
    name: 'Peacock Blue Mor Paithani',
    sku: 'VC-PAI-003',
    collectionSlug: 'paithani-silk',
    fabric: 'Pure Mulberry Silk',
    region: 'Paithan, Aurangabad District, Maharashtra',
    zariType: 'Gold Zari',
    occasion: ['Festival', 'Party'],
    price: 54000,
    stockQty: 3,
    blousePiece: 'included',
    weaver: 'Yeola Paithani Kendra',
    isFeatured: false,
    description:
      'A vibrant Paithani in the deep indigo-teal most prized by Maharashtrian women for festive occasions — known locally as mor neela (peacock blue). ' +
      'The pallu carries a double row of mor motifs in orange and gold, and the six-inch border is a classic asawali flowering-vine pattern in dense gold zari. ' +
      'Scattered mango buti motifs dot the body at regular intervals.',
    story:
      'The deep peacock blue of this Paithani comes from natural indigo from the Godavari river basin — a dyeing tradition kept alive by a single family of khatri artisans in Paithan for nine generations. ' +
      'Natural indigo produces a depth and warmth of colour that synthetic dyes cannot replicate, shifting from turquoise in sunlight to deep teal indoors.',
    careInstructions: 'Dry clean only. The first dry clean may lighten the colour slightly — this is normal with natural indigo. Do not use enzyme-based detergents.',
  },
  {
    name: 'Emerald Green Parrot Paithani',
    sku: 'VC-PAI-004',
    collectionSlug: 'paithani-silk',
    fabric: 'Pure Mulberry Silk',
    region: 'Paithan, Aurangabad District, Maharashtra',
    zariType: 'Pure Zari',
    occasion: ['Wedding', 'Festival'],
    price: 74000,
    stockQty: 2,
    blousePiece: 'included',
    weaver: 'Yeola Paithani Kendra',
    isFeatured: false,
    description:
      'A lush emerald green Paithani featuring the rare popat (parrot) pallu motif — a design more difficult to execute than the peacock as the parrot\'s smaller body requires finer thread manipulation. ' +
      'Sixteen parrots in scarlet and gold fill the pallu field, surrounded by tiny flowers and creeper vines. ' +
      'The border is a wide pure zari lotus chain in champagne against the emerald ground.',
    story:
      'The parrot motif in Paithani is associated with the tradition of the green popat being the sacred bird of Maharashtra\'s Vitthal temple at Pandharpur. ' +
      'Weavers at Yeola have maintained this motif in their pattern books for over one hundred and fifty years, passing the thread-count sequences from father to son.',
    careInstructions: 'Dry clean only. Emerald green from natural dyes may require careful handling in humid climates — store with silica gel.',
  },
  {
    name: 'Deep Orange Asawali Festival Paithani',
    sku: 'VC-PAI-005',
    collectionSlug: 'paithani-silk',
    fabric: 'Pure Mulberry Silk',
    region: 'Paithan, Aurangabad District, Maharashtra',
    zariType: 'Gold Zari',
    occasion: ['Festival', 'Party'],
    price: 48000,
    stockQty: 4,
    blousePiece: 'included',
    weaver: 'Paithan Silk Weavers Cooperative',
    isFeatured: false,
    description:
      'A radiant deep orange Paithani perfect for Navratri, Gudi Padwa, and Ganesh Chaturthi. ' +
      'The pallu features the full asawali (flowering vine) pattern that covers every square inch in a continuous scroll of gold flowers and green leaves. ' +
      'The four-inch border carries the classic Paithani lotus chain in gold on orange.',
    story:
      'Orange Paithani sarees are the most commonly worn at Maharashtrian community festivals and have been so since the Maratha empire when saffron — the colour of the Maratha warrior flag — became the festive colour of Maharashtra. ' +
      'The asawali vine is the oldest Paithani border pattern, found in specimens from the Aurangabad museum dating to the 16th century.',
    careInstructions: 'Dry clean only. Orange shades in natural dye may require careful storage away from light to maintain depth of colour.',
  },
  {
    name: 'Ivory Pearl Paithani Silk',
    sku: 'VC-PAI-006',
    collectionSlug: 'paithani-silk',
    fabric: 'Pure Mulberry Silk',
    region: 'Paithan, Aurangabad District, Maharashtra',
    zariType: 'Silver Zari',
    occasion: ['Wedding', 'Festival'],
    price: 62000,
    stockQty: 2,
    blousePiece: 'included',
    weaver: 'Yeola Paithani Kendra',
    isFeatured: false,
    description:
      'An ethereal ivory Paithani with a silver zari peacock pallu — the rarest combination in the Paithani palette, traditionally reserved for remarriage and second wedding ceremonies in Maharashtra. ' +
      'The pallu features nine silver peacocks in a diagonal arrangement on the ivory ground, and the body carries scattered silver mango buti. ' +
      'The border is a fine silver lotus chain on ivory, almost invisible against the body — a mark of refined restraint.',
    story:
      'Ivory Paithani sarees are known as the saree of second beginnings in Maharashtrian culture. ' +
      'The silver peacock on ivory combination is said to have been created by Peshwa Bajirao II\'s court weavers at the request of a widowed noblewoman seeking to remarry with dignified restraint. ' +
      'The tradition has been maintained in Yeola\'s pattern books to this day.',
    careInstructions: 'Dry clean only. Ivory silk is the most delicate to care for — keep away from coloured garments, strong perfume, and direct light.',
  },
  {
    name: 'Royal Purple Wedding Paithani',
    sku: 'VC-PAI-007',
    collectionSlug: 'paithani-silk',
    fabric: 'Pure Mulberry Silk',
    region: 'Paithan, Aurangabad District, Maharashtra',
    zariType: 'Pure Zari',
    occasion: ['Wedding'],
    price: 88000,
    stockQty: 1,
    blousePiece: 'included',
    weaver: 'Paithan Silk Weavers Cooperative',
    isFeatured: false,
    description:
      'A magnificent royal purple Paithani wedding silk woven in the traditional Peshwa court style. ' +
      'The full pallu features a field of interlocking golden lotuses on the deep aubergine ground — a motif associated with the Rashtrakuta dynasty rulers who patronised Paithan\'s weavers. ' +
      'The wide pure zari border on both sides is a double-lotus chain in champagne gold. Comes with Silk Mark certification.',
    story:
      'Purple was the colour of the Rashtrakuta royal household and is considered the most prestigious Paithani colour in scholarly circles. ' +
      'Only a handful of Paithan families still produce purple Paithani — the natural purple dye from the Murex shellfish has been replaced by chemical dye, but the technique of fixing it without damaging the silk remains a closely guarded family secret.',
    careInstructions: 'Dry clean only. Chemical purple dyes are more stable than natural ones but still susceptible to bleaching. Keep away from direct sunlight and strong artificial lighting.',
  },
  {
    name: 'Champagne Zari Paithani',
    sku: 'VC-PAI-008',
    collectionSlug: 'paithani-silk',
    fabric: 'Pure Mulberry Silk',
    region: 'Paithan, Aurangabad District, Maharashtra',
    zariType: 'Pure Zari',
    occasion: ['Wedding', 'Party'],
    price: 58000,
    stockQty: 3,
    blousePiece: 'included',
    weaver: 'Yeola Paithani Kendra',
    isFeatured: false,
    description:
      'A lustrous champagne Paithani silk where the gold zari and the silk body are so close in tone that the saree seems to glow from within. ' +
      'The pallu features a classic peacock and lotus combination in subtle gold-on-gold, creating a saree for the woman who prefers quiet opulence over vivid drama. ' +
      'The border is a pure zari vine pattern in a slightly darker gold, barely visible and yet unmistakably Paithani.',
    story:
      'Champagne Paithani sarees gained popularity in the 1990s among Maharashtrian NRI brides who wanted the tradition of Paithani weaving in a colour that would work in international settings. ' +
      'The Yeola Paithani Kendra developed this gold-on-gold technique in response, creating a new design language that has since become one of their best-selling styles.',
    careInstructions: 'Dry clean only. Gold-on-gold is the most subtle combination and must be stored flat to maintain the zari position.',
  },
  {
    name: 'Pink Lotus Festival Paithani',
    sku: 'VC-PAI-009',
    collectionSlug: 'paithani-silk',
    fabric: 'Pure Mulberry Silk',
    region: 'Paithan, Aurangabad District, Maharashtra',
    zariType: 'Gold Zari',
    occasion: ['Festival', 'Party'],
    price: 46000,
    stockQty: 4,
    blousePiece: 'included',
    weaver: 'Paithan Silk Weavers Cooperative',
    isFeatured: false,
    description:
      'A cheerful deep pink Paithani with a wide gold zari lotus pallu — the lotus (kamala) being the most auspicious motif in the Paithani vocabulary. ' +
      'Twelve large open lotus flowers in gold fill the pallu on the pink ground, with tiny mango buti scattered through the body. ' +
      'A perfect saree for engagements, temple visits, and family festivals.',
    story:
      'The lotus pallu is considered the most sacred of all Paithani pallu designs — the lotus is the seat of Lakshmi, the goddess of wealth, and wearing a lotus pallu is believed to bring prosperity to the wearer. ' +
      'Weavers in Paithan always begin the lotus pallu by offering prayers to their looms and the Godavari river before the first shuttle pass.',
    careInstructions: 'Dry clean only. Pink shades with gold zari look most vivid when stored flat — hanging concentrates the weight of zari on the folds.',
  },
  {
    name: 'Forest Teal Paithani Silk',
    sku: 'VC-PAI-010',
    collectionSlug: 'paithani-silk',
    fabric: 'Pure Mulberry Silk',
    region: 'Paithan, Aurangabad District, Maharashtra',
    zariType: 'Gold Zari',
    occasion: ['Wedding', 'Festival'],
    price: 72000,
    stockQty: 2,
    blousePiece: 'included',
    weaver: 'Yeola Paithani Kendra',
    isFeatured: false,
    description:
      'A deep forest teal Paithani — a rare and sophisticated alternative to the more common peacock blue. ' +
      'The pallu features the traditional peacock in the "dancing pose" (natya mudra) with fully spread tail feathers in gold and orange on the dark teal ground. ' +
      'The wide gold zari border carries the Maharashtrian kuyri (mango cluster) motif.',
    story:
      'Forest teal Paithani sarees are a speciality of Yeola weavers and are not traditionally made in Paithan itself — Yeola developed this colour in the 19th century using a combination of natural indigo and turmeric that produces the distinctive greenish teal unavailable from a single dye. ' +
      'The natya mudra peacock is considered the most technically demanding of all Paithani pallu motifs.',
    careInstructions: 'Dry clean only. The teal colour is a two-dye process and must be kept away from moisture to prevent uneven fading.',
  },

  // ── GADWAL SILK (10) ────────────────────────────────────────────────────

  {
    name: 'Turmeric Gopuram Gadwal Pattu',
    sku: 'VC-GAD-001',
    collectionSlug: 'gadwal-silk',
    fabric: 'Cotton Body, Pure Silk Pallu',
    region: 'Gadwal, Mahabubnagar District, Telangana',
    zariType: 'Pure Zari',
    occasion: ['Wedding', 'Festival'],
    price: 34800,
    stockQty: 3,
    blousePiece: 'included',
    weaver: 'Gadwal Weavers Cooperative',
    isFeatured: true,
    description:
      'An authentic GI-tagged Gadwal pattu in turmeric yellow with a pure silk pallu featuring the gold zari gopuram (temple tower) border motif. ' +
      'The korvai technique joins the lightweight cotton body to the ceremonial silk pallu at the loom, with the join virtually invisible. ' +
      'The contrast border runs on both sides in deep maroon with a gold zari stripe.',
    story:
      'Gadwal\'s defining innovation — joining a cotton body to a silk pallu at the loom — was developed to suit the hot Deccan plateau climate. ' +
      'The korvai interlocking technique requires a master weaver; the join must be perfectly aligned or the entire saree is rejected. ' +
      'Gadwal received its GI tag in 2004 in recognition of this unique craft.',
    careInstructions: 'Dry clean only for the silk pallu. The cotton body can be hand-washed with mild soap. Store with the pallu folded inward.',
  },
  {
    name: 'Flame Red Bridal Gadwal Silk',
    sku: 'VC-GAD-002',
    collectionSlug: 'gadwal-silk',
    fabric: 'Cotton Body, Pure Silk Pallu',
    region: 'Gadwal, Mahabubnagar District, Telangana',
    zariType: 'Pure Zari',
    occasion: ['Wedding'],
    price: 42000,
    stockQty: 2,
    blousePiece: 'included',
    weaver: 'Sompeta Handlooms',
    isFeatured: true,
    description:
      'A regal flame-red Gadwal saree in the classic bridal colour of Telangana. ' +
      'The cotton body carries a dense woven check in red and maroon, and the pure silk pallu features an elaborate gold zari gopuram border — four rows of tiered towers separated by running creeper vines in silver zari. ' +
      'The blouse piece is matching flame-red silk with a gold border stripe.',
    story:
      'The gopuram motif in Gadwal borders traces directly to the royal patronage of the Wanaparthy zamindari family, who commissioned these sarees for temple festival processions in the 19th century. ' +
      'The Sompeta family of weavers has been weaving this specific gopuram pattern for four generations.',
    careInstructions: 'Dry clean only. Store with the silk pallu folded inward against the cotton body. Press only the cotton section; steam the silk pallu.',
  },
  {
    name: 'Ivory Korvai Pattu Gadwal',
    sku: 'VC-GAD-003',
    collectionSlug: 'gadwal-silk',
    fabric: 'Cotton Body, Pure Silk Pallu',
    region: 'Gadwal, Mahabubnagar District, Telangana',
    zariType: 'Silver Zari',
    occasion: ['Wedding', 'Festival'],
    price: 36500,
    stockQty: 4,
    blousePiece: 'included',
    weaver: 'Gadwal Weavers Cooperative',
    isFeatured: false,
    description:
      'An elegant ivory Gadwal pattu where the white cotton body transitions into a pure silk pallu in the same ivory tone, making the korvai join particularly invisible and the overall effect one of restrained luxury. ' +
      'The silver zari border runs in a fine double-stripe along both edges, and the pallu carries a wide silver temple border in the classic gopuram motif.',
    story:
      'Ivory Gadwal pattu sarees are traditionally given as a wedding gift from the groom\'s family to the bride\'s mother in Telangana — a gesture of respect for the elder generation. ' +
      'The nearly invisible korvai join in ivory is considered the highest mark of skill, as any imperfection in alignment is immediately visible against the uniform ivory ground.',
    careInstructions: 'Dry clean only. Ivory is the most delicate colour — handle with clean, dry hands at all times. Store separately from any coloured garment.',
  },
  {
    name: 'Peacock Blue Zari Gadwal',
    sku: 'VC-GAD-004',
    collectionSlug: 'gadwal-silk',
    fabric: 'Cotton Body, Pure Silk Pallu',
    region: 'Gadwal, Mahabubnagar District, Telangana',
    zariType: 'Pure Zari',
    occasion: ['Festival', 'Party'],
    price: 38000,
    stockQty: 3,
    blousePiece: 'included',
    weaver: 'Sompeta Handlooms',
    isFeatured: false,
    description:
      'A striking peacock blue Gadwal pattu where the lightweight cotton body in deep teal is joined to a pure silk pallu carrying a wide pure gold zari temple border and a vine motif creeper. ' +
      'The contrast border runs in deep maroon on both sides, and the blouse piece is in pure peacock blue silk with a single gold stripe.',
    story:
      'Peacock blue is the festival colour of Telangana\'s Bonalu and Bathukamma celebrations, when women in the Gadwal and Mahabubnagar districts traditionally wear the boldest colours in their wardrobe. ' +
      'The Sompeta weavers developed the peacock blue cotton body specifically to meet this festival demand while retaining the pure silk pallu.',
    careInstructions: 'Dry clean only. The peacock blue cotton body is colourfast but the first wash may bleed — separate from whites when washing the cotton section.',
  },
  {
    name: 'Forest Green Temple Gadwal Silk',
    sku: 'VC-GAD-005',
    collectionSlug: 'gadwal-silk',
    fabric: 'Cotton Body, Pure Silk Pallu',
    region: 'Gadwal, Mahabubnagar District, Telangana',
    zariType: 'Pure Zari',
    occasion: ['Wedding', 'Festival'],
    price: 44000,
    stockQty: 2,
    blousePiece: 'included',
    weaver: 'Gadwal Weavers Cooperative',
    isFeatured: false,
    description:
      'A deep forest green Gadwal pattu with a pure silk pallu in contrasting deep maroon — one of Gadwal\'s oldest and most auspicious colour combinations. ' +
      'The wide pure gold zari temple border on the pallu carries the rare shikhara (temple spire) motif, more intricate than the standard gopuram. ' +
      'The cotton body carries a subtle woven self-check in two shades of green.',
    story:
      'The green-and-maroon colour combination in Gadwal is known as the "kurnool pair" — named after the annual festival at the Kurnool Koteshwara temple where weavers from Gadwal present their finest sarees as offerings. ' +
      'The shikhara motif in the border is a more refined variant of the gopuram, showing the tapering pointed roof rather than the broad multi-tiered gateway.',
    careInstructions: 'Dry clean only. Store with pallu folded inward. The maroon silk pallu is more susceptible to fading in sunlight than the green cotton body.',
  },
  {
    name: 'Deep Maroon Gadwal Pattu',
    sku: 'VC-GAD-006',
    collectionSlug: 'gadwal-silk',
    fabric: 'Cotton Body, Pure Silk Pallu',
    region: 'Gadwal, Mahabubnagar District, Telangana',
    zariType: 'Pure Zari',
    occasion: ['Wedding', 'Festival'],
    price: 46000,
    stockQty: 2,
    blousePiece: 'included',
    weaver: 'Sompeta Handlooms',
    isFeatured: false,
    description:
      'A sumptuous deep maroon Gadwal pattu — the colour worn by Telangana brides in the pre-wedding rituals of haldi and mehendi. ' +
      'The pure silk pallu in contrasting ivory carries a dense pure gold zari gopuram border five inches wide. ' +
      'The cotton body is woven in a fine plain weave maroon, giving the saree a clean, solid drape.',
    story:
      'Deep maroon is the traditional colour of the Gadwal temple offerings — sarees in this shade are woven specifically for the Srisailam and Alampur temple festivals in Telangana. ' +
      'The ivory silk pallu against maroon body is a sacred colour combination in the Shaiva tradition of the Deccan.',
    careInstructions: 'Dry clean only. Maroon dye is one of the most stable of the natural colours — the cotton body is especially durable.',
  },
  {
    name: 'Rose Silk Pallu Gadwal',
    sku: 'VC-GAD-007',
    collectionSlug: 'gadwal-silk',
    fabric: 'Cotton Body, Pure Silk Pallu',
    region: 'Gadwal, Mahabubnagar District, Telangana',
    zariType: 'Gold Zari',
    occasion: ['Festival', 'Party'],
    price: 31000,
    stockQty: 5,
    blousePiece: 'included',
    weaver: 'Gadwal Weavers Cooperative',
    isFeatured: false,
    description:
      'A contemporary Gadwal pattu in pale rose with a soft pink silk pallu — a new-generation colour combination that retains the GI-certified korvai technique while appealing to modern tastes. ' +
      'The gold zari border is a slim two-inch stripe on both sides, and the pallu carries a fine gold lotus vine motif. ' +
      'An ideal choice for engagements and festive brunches.',
    story:
      'The Gadwal Weavers Cooperative introduced pastel body colours in the early 2000s to attract younger buyers without abandoning the traditional korvai technique. ' +
      'The rose-and-pink combination was the first of these "new palette" sarees and remains the most popular in the cooperative\'s export collection.',
    careInstructions: 'Dry clean only. Pastel shades require extra care from cosmetics and perfume — apply these before wearing.',
  },
  {
    name: 'Saffron Border Gadwal Pattu',
    sku: 'VC-GAD-008',
    collectionSlug: 'gadwal-silk',
    fabric: 'Cotton Body, Pure Silk Pallu',
    region: 'Gadwal, Mahabubnagar District, Telangana',
    zariType: 'Pure Zari',
    occasion: ['Wedding', 'Festival'],
    price: 39000,
    stockQty: 3,
    blousePiece: 'included',
    weaver: 'Sompeta Handlooms',
    isFeatured: false,
    description:
      'A vibrant saffron Gadwal pattu with an ivory pure silk pallu — the colours of Ugadi and Diwali in Telangana. ' +
      'The wide pure gold zari border carries the traditional temple creeper in a four-inch running vine pattern. ' +
      'The cotton body is a medium-weight plain weave in vivid saffron that holds the colour through multiple washes.',
    story:
      'Saffron is the colour of the sunrise and new beginnings in Deccan culture. ' +
      'The saffron-and-ivory Gadwal is gifted at Ugadi (Telugu New Year) and is considered to bring prosperity and clarity to the household that receives it. ' +
      'The Sompeta family has been weaving this specific colour combination since the 1960s.',
    careInstructions: 'Dry clean only for the silk pallu. The cotton body is durable — hand wash in cold water with mild soap.',
  },
  {
    name: 'Champagne Gadwal Festive Silk',
    sku: 'VC-GAD-009',
    collectionSlug: 'gadwal-silk',
    fabric: 'Cotton Body, Pure Silk Pallu',
    region: 'Gadwal, Mahabubnagar District, Telangana',
    zariType: 'Silver Zari',
    occasion: ['Festival', 'Party'],
    price: 33000,
    stockQty: 4,
    blousePiece: 'included',
    weaver: 'Gadwal Weavers Cooperative',
    isFeatured: false,
    description:
      'A graceful champagne Gadwal pattu with a matching champagne silk pallu and silver zari temple border — a saree for the woman who prefers elegant neutrals. ' +
      'The barely-there silver zari vine on the pallu creates a shimmer visible only in motion. ' +
      'The korvai join in champagne on champagne is Gadwal weaving at its most refined.',
    story:
      'The champagne Gadwal is a 21st-century creation from the Gadwal Weavers Cooperative, developed specifically for corporate gifting and formal occasion wear among Hyderabad\'s professional class. ' +
      'It retains every element of the traditional GI-certified craft while presenting a colour palette suited to air-conditioned banquet halls and boardroom lunches.',
    careInstructions: 'Dry clean only. Handle champagne silk with extra care near metal jewellery — the soft colour scratches easily.',
  },
  {
    name: 'Violet Silk Gadwal Pattu',
    sku: 'VC-GAD-010',
    collectionSlug: 'gadwal-silk',
    fabric: 'Cotton Body, Pure Silk Pallu',
    region: 'Gadwal, Mahabubnagar District, Telangana',
    zariType: 'Pure Zari',
    occasion: ['Wedding', 'Festival'],
    price: 41000,
    stockQty: 2,
    blousePiece: 'included',
    weaver: 'Sompeta Handlooms',
    isFeatured: false,
    description:
      'A deep violet Gadwal pattu with a gold silk pallu — a bold, contemporary bridal combination that has gained rapid popularity in Hyderabad and Bengaluru. ' +
      'The pure gold silk pallu carries a wide pure gold zari border in the classic four-tower gopuram pattern, and the violet cotton body is woven in a fine plain weave that drapes effortlessly.',
    story:
      'The violet-and-gold combination in Gadwal is a relatively recent creation — it does not appear in any pre-1980 Gadwal specimens. ' +
      'It was developed by a young weaver in the Sompeta family after she saw a violet and gold sari on a Bollywood actress and decided to attempt the colour in the Gadwal technique. ' +
      'It is now one of the top-selling bridal Gadwals at every Hyderabad silk expo.',
    careInstructions: 'Dry clean only. Violet dye is particularly light-sensitive — store away from windows.',
  },

  // ── MIX SILK (10) ───────────────────────────────────────────────────────

  {
    name: 'Kandangi Earth-Check Cotton Silk',
    sku: 'VC-MIX-001',
    collectionSlug: 'mix-silk',
    fabric: 'Cotton Silk',
    region: 'Karaikudi, Sivaganga District, Tamil Nadu',
    zariType: 'Copper Zari',
    occasion: ['Daily Wear', 'Festival'],
    price: 14200,
    stockQty: 15,
    blousePiece: 'not_included',
    weaver: 'Karaikudi Handlooms',
    isFeatured: true,
    description:
      'A relaxed daily-wear saree in the classic Kandangi large-check pattern — earthy terracotta and ecru checks in a soft cotton-silk blend with a copper zari line at each check border. ' +
      'The copper zari gives the saree a quiet shimmer suited for festivals, while the light cotton-silk body ensures comfort through long summer days. ' +
      'The saree drapes effortlessly and requires no pleating tricks.',
    story:
      'Kandangi is a village near Karaikudi in the Chettinad region of Tamil Nadu, and the bold check pattern of this saree is its most recognised product. ' +
      'The copper zari border line at each check intersection is a Kandangi signature not found in check sarees from other weaving centres.',
    careInstructions: 'Machine wash on gentle cycle in a mesh bag. Or hand wash with mild detergent. Do not tumble dry. Iron damp at medium heat.',
  },
  {
    name: 'Pochampally Double Ikat Silk',
    sku: 'VC-MIX-002',
    collectionSlug: 'mix-silk',
    fabric: 'Pure Silk',
    region: 'Bhoodan Pochampally, Nalgonda District, Telangana',
    zariType: 'No Zari',
    occasion: ['Daily Wear', 'Office', 'Festival'],
    price: 31750,
    stockQty: 5,
    blousePiece: 'on_request',
    weaver: 'Pochampally Weavers Cooperative',
    isFeatured: false,
    description:
      'A masterwork of the double ikat technique — deep indigo and off-white geometric diamond patterns that emerge from a resist-dyeing process that pre-dates the weaving itself. ' +
      'The saree has no zari, letting the sharpness of the ikat geometry carry the visual weight. ' +
      'A UNESCO-recognised craft and GI-tagged heritage product.',
    story:
      'Pochampally is the only weaving centre in India that produces double ikat — a technique where both warp and weft threads are resist-dyed before weaving. ' +
      'Double ikat is found in only three locations globally: Pochampally, Patan in Gujarat, and Tenganan in Bali. ' +
      'The dyeing alone takes three to four weeks; the weaving takes another two to three weeks.',
    careInstructions: 'Dry clean recommended. If hand-washing, use cold water and mild soap — the first wash may bleed. Do not wring or tumble dry.',
  },
  {
    name: 'Champagne Mysore Silk Crepe',
    sku: 'VC-MIX-003',
    collectionSlug: 'mix-silk',
    fabric: 'Mysore Silk Crepe',
    region: 'Mysuru, Karnataka',
    zariType: 'Silver Zari',
    occasion: ['Office', 'Daily Wear'],
    price: 22900,
    stockQty: 8,
    blousePiece: 'included',
    weaver: 'Karnataka Silk Industries Corporation',
    isFeatured: false,
    description:
      'Effortless everyday elegance in a whisper-light champagne crepe — the saree equivalent of a white shirt. ' +
      'The characteristic Mysore silk crepe texture drapes in smooth, fluid folds and requires no petticoat to hold its shape. ' +
      'The four-inch silver zari border is clean and unadorned, letting the champagne lustre do the work.',
    story:
      'Mysore Silk is one of only two silk varieties in India to carry both a GI tag and the Silk Mark certification. ' +
      'Every metre woven at the Karnataka Silk Industries Corporation carries a holographic Silk Mark tag. ' +
      'The crepe variant uses a twisted warp thread that creates its characteristic crinkled texture.',
    careInstructions: 'Hand wash with mild silk-specific shampoo in cold water. Do not rub. Dry flat in shade. Iron on low heat on the reverse side.',
  },
  {
    name: 'Kota Doria Silk Check',
    sku: 'VC-MIX-004',
    collectionSlug: 'mix-silk',
    fabric: 'Silk-Cotton (Kota Doria)',
    region: 'Kaithoon, Kota District, Rajasthan',
    zariType: 'Gold Zari',
    occasion: ['Daily Wear', 'Festival', 'Office'],
    price: 18500,
    stockQty: 10,
    blousePiece: 'not_included',
    weaver: 'Kaithoon Handloom Cluster',
    isFeatured: false,
    description:
      'A featherweight Kota Doria saree in a pale ivory and gold check with a fine gold zari stripe border — perfect for the blistering Rajasthan and Gujarat summers. ' +
      'The characteristic khat (square) pattern of the Kota Doria weave creates a transparency and lightness no other saree fabric can match. ' +
      'Easy to drape and even easier to wear all day.',
    story:
      'Kota Doria takes its name from the city of Kota and the Persian word doria (thread), and is woven exclusively in the village of Kaithoon nearby. ' +
      'The alternating silk and cotton threads create a fabric so light that a full six-yard saree can be folded into the size of a matchbox.',
    careInstructions: 'Gentle hand wash in cold water. The light fabric is delicate — avoid rough handling. Iron at low heat.',
  },
  {
    name: 'Chanderi Tissue Silk Saree',
    sku: 'VC-MIX-005',
    collectionSlug: 'mix-silk',
    fabric: 'Chanderi Silk-Cotton',
    region: 'Chanderi, Ashoknagar District, Madhya Pradesh',
    zariType: 'Silver Zari',
    occasion: ['Festival', 'Party', 'Office'],
    price: 24000,
    stockQty: 7,
    blousePiece: 'included',
    weaver: 'Chanderi Weavers Cooperative',
    isFeatured: false,
    description:
      'A gossamer Chanderi tissue saree in mint green with a fine silver zari border and scattered silver coin buti across the body. ' +
      'The Chanderi tissue fabric — woven from silk warp and fine mercerised cotton weft — has a translucent, shimmering quality unique in Indian handlooms. ' +
      'Light and airy yet grand enough for any formal occasion.',
    story:
      'Chanderi has been a weaving centre since the Malwa Sultanate of the 15th century when the Malwa court commissioned sarees from its weavers. ' +
      'The tissue fabric is created by a special tension technique on the loom where the warp is held at twice the normal tension, pulling the weft so thin it becomes semi-transparent.',
    careInstructions: 'Dry clean only. Chanderi tissue tears easily — handle with care and avoid sharp jewellery that can snag the fabric.',
  },
  {
    name: 'Uppada Jamdani Pure Silk',
    sku: 'VC-MIX-006',
    collectionSlug: 'mix-silk',
    fabric: 'Pure Silk (Jamdani Weave)',
    region: 'Uppada, East Godavari District, Andhra Pradesh',
    zariType: 'Pure Zari',
    occasion: ['Festival', 'Party', 'Wedding'],
    price: 42500,
    stockQty: 3,
    blousePiece: 'included',
    weaver: 'Uppada Handloom Weavers Society',
    isFeatured: false,
    description:
      'An Uppada jamdani in deep teal with a pure gold zari floral buti woven directly into the silk ground in the discontinuous weft technique. ' +
      'The jamdani buti — a stylised flower with leaves and tendrils — appears to float on the silk surface, giving the fabric a three-dimensional depth. ' +
      'The five-inch pure zari border carries a classic Andhra temple-pillar design.',
    story:
      'Uppada jamdani is Andhra Pradesh\'s most celebrated handloom and is woven on the banks of the Godavari river. ' +
      'Unlike the more famous Dhaka jamdani of Bangladesh, Uppada uses silk rather than cotton, giving the fabric a lustre and weight that makes it suited for ceremonial wear. ' +
      'Each buti motif is individually woven with a separate bobbin.',
    careInstructions: 'Dry clean only. The floating jamdani buti can snag on rough surfaces — store in a smooth muslin bag.',
  },
  {
    name: 'Sambalpuri Bandha Silk',
    sku: 'VC-MIX-007',
    collectionSlug: 'mix-silk',
    fabric: 'Pure Tussar Silk (Ikat)',
    region: 'Sambalpur, Odisha',
    zariType: 'No Zari',
    occasion: ['Festival', 'Daily Wear'],
    price: 28000,
    stockQty: 6,
    blousePiece: 'on_request',
    weaver: 'Sambalpur Handloom Cooperative',
    isFeatured: false,
    description:
      'A Sambalpuri bandha saree in deep rust with white geometric ikat patterns — the traditional phula (flower) and shankha (conch) motifs woven using the resist-dye ikat technique native to Odisha. ' +
      'The distinctive blurred edges of the ikat pattern are a mark of hand-dyeing authenticity and cannot be replicated on a power loom. ' +
      'Recognised with a GI tag in 2010.',
    story:
      'Sambalpuri ikat — known locally as bandha — is a single ikat technique where only the warp threads are resist-dyed. ' +
      'The phula and shankha motifs have deep roots in Vaishnava tradition — the shankha (conch) is the sacred instrument of Lord Vishnu and appears in temple carvings throughout Odisha. ' +
      'The Sambalpur region has been weaving these patterns for over four hundred years.',
    careInstructions: 'Dry clean recommended. If hand washing, use cold water — the first wash may bleed from the resist-dyed sections.',
  },
  {
    name: 'Mangalagiri Cotton Silk Saree',
    sku: 'VC-MIX-008',
    collectionSlug: 'mix-silk',
    fabric: 'Cotton Silk',
    region: 'Mangalagiri, Guntur District, Andhra Pradesh',
    zariType: 'Gold Zari',
    occasion: ['Daily Wear', 'Office', 'Festival'],
    price: 16800,
    stockQty: 12,
    blousePiece: 'not_included',
    weaver: 'Mangalagiri Handloom Weavers Cooperative',
    isFeatured: false,
    description:
      'A Mangalagiri cotton silk saree in deep teal with a gold nizam (self-woven) border — the distinctive Mangalagiri weave that creates a fabric soft as muslin but with the weight of silk. ' +
      'The gold zari nizam border is woven directly into the cotton-silk blend without a separate zari thread — the gold effect comes from a tightly twisted cotton thread in a golden shade. ' +
      'The saree has the characteristic crisp drape that Mangalagiri is known for.',
    story:
      'Mangalagiri takes its name from the sacred hill of Lord Narasimha, and its sarees are offered at the Panakala Narasimha Swamy temple during the annual Brahmotsavam festival. ' +
      'The nizam border technique — where the gold effect is achieved without real zari by twisting golden cotton — was developed during the Nizam of Hyderabad\'s patronage of Andhra handlooms in the 18th century.',
    careInstructions: 'Machine wash on gentle cycle or hand wash. The cotton-silk blend is more durable than pure silk. Iron at medium heat while damp.',
  },
  {
    name: 'Venkatagiri Jamdani Cotton Silk',
    sku: 'VC-MIX-009',
    collectionSlug: 'mix-silk',
    fabric: 'Cotton Silk (Jamdani)',
    region: 'Venkatagiri, Nellore District, Andhra Pradesh',
    zariType: 'Gold Zari',
    occasion: ['Festival', 'Party'],
    price: 34000,
    stockQty: 4,
    blousePiece: 'included',
    weaver: 'Venkatagiri Silk Weavers Society',
    isFeatured: false,
    description:
      'A Venkatagiri cotton silk saree with a classic jamdani floral buti woven in gold zari on a deep rose ground — one of the finest blends of Andhra\'s two great handloom traditions. ' +
      'The jamdani buti appears on alternate rows of the body, creating a pattern that is sparse and elegant rather than dense. ' +
      'The wide gold zari border carries a peacock and vine running pattern.',
    story:
      'Venkatagiri was the handloom seat of the Venkatagiri Raja estate, whose family patronised the weavers for over two hundred years. ' +
      'The estate\'s accounts from the 18th century record payments to weavers for cotton silk jamdani sarees — making Venkatagiri one of the oldest recorded centres for the jamdani technique in South India.',
    careInstructions: 'Dry clean only. The jamdani buti uses a separate supplementary weft — do not pull or snag the raised thread.',
  },
  {
    name: 'Ilkal-Paithani Fusion Silk',
    sku: 'VC-MIX-010',
    collectionSlug: 'mix-silk',
    fabric: 'Pure Mulberry Silk',
    region: 'Ilkal × Yeola, Karnataka & Maharashtra',
    zariType: 'Pure Zari',
    occasion: ['Wedding', 'Festival'],
    price: 58000,
    stockQty: 2,
    blousePiece: 'included',
    weaver: 'Collaborative — Ilkal Handloom House & Yeola Paithani Kendra',
    isFeatured: true,
    description:
      'A rare collaboration between the weavers of Ilkal and Yeola — a saree where the body and border use the Ilkal tope teni and kasuti traditions while the pallu is woven in the Paithani interlocking weft technique with peacock and lotus motifs. ' +
      'The result is a saree that embodies two of India\'s most celebrated GI-tagged silk heritages in a single six-yard cloth. ' +
      'Only twelve pieces are produced per year.',
    story:
      'This fusion saree was the brainchild of a project by the Handloom Export Promotion Council in 2018 to create contemporary sarees that showcased more than one heritage weaving technique. ' +
      'The master weavers of Ilkal and Yeola worked together over six months to develop a technique where the Ilkal body could be seamlessly transitioned into a Paithani pallu without either tradition losing its identity.',
    careInstructions: 'Dry clean only. This saree contains real gold zari from both traditions — store in original acid-free packaging. Certificate of authenticity included.',
  },

];

// ─────────────────────────────────────────────────────────────────────────────
// SEED RUNNER
// ─────────────────────────────────────────────────────────────────────────────

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
      { upsert: true, returnDocument: 'after' }
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
    { upsert: true, returnDocument: 'after' }
  );
  console.log(`✓ User        : ${userDoc.email}`);

  // ── 3. Collections ────────────────────────────────────────────────────────
  const collectionDocs: Record<string, mongoose.Types.ObjectId> = {};
  for (const c of COLLECTIONS) {
    const doc = await CollectionModel.findOneAndUpdate(
      { slug: c.slug },
      { $set: c },
      { upsert: true, returnDocument: 'after' }
    );
    collectionDocs[c.slug] = doc._id;
    console.log(`✓ Collection  : ${c.name}`);
  }

  // ── 4. Products (10 per collection) ───────────────────────────────────────
  let productCount = 0;
  for (const p of PRODUCTS) {
    const collectionId = collectionDocs[p.collectionSlug];
    if (!collectionId) {
      console.warn(`  WARN: Collection not found for "${p.collectionSlug}", skipping "${p.name}"`);
      continue;
    }
    const { collectionSlug, ...rest } = p;
    const slug = slugify(p.name);
    await ProductModel.findOneAndUpdate(
      { $or: [{ sku: p.sku }, { slug }] },
      {
        $set: {
          ...rest,
          slug,
          collectionId,
          makerImageUrl: '',
          isActive:      true,
          images:        [],
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
    productCount++;
  }
  console.log(`✓ Products    : ${productCount} upserted (${productCount / COLLECTIONS.length} per collection)`);

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
      { upsert: true, returnDocument: 'after' }
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
    { upsert: true, returnDocument: 'after' }
  );
  console.log(`✓ Site Config : upserted`);

  // ── 7. Lookbook ───────────────────────────────────────────────────────────
  const existingLookbook = await LookbookModel.findOne({});
  if (!existingLookbook) {
    await LookbookModel.create({
      imageUrl:  'https://res.cloudinary.com/placeholder/image/upload/v1/vc-sarees/lookbook-sample',
      caption:   'Sample Lookbook Entry — replace image via admin panel',
      sortOrder: 1,
      isActive:  false,
    });
    console.log(`✓ Lookbook    : 1 sample entry created (inactive — update image via admin)`);
  } else {
    console.log(`✓ Lookbook    : existing entries preserved`);
  }

  // ── 8. Sample Order ───────────────────────────────────────────────────────
  const SEED_ORDER_NUMBER = 'VC-SEED-0001';
  const firstProduct = await ProductModel.findOne({ sku: 'VC-ILK-001' });
  const existingOrder = await OrderModel.findOne({ orderNumber: SEED_ORDER_NUMBER });
  if (!existingOrder && firstProduct) {
    const now = new Date();
    await OrderModel.create({
      orderNumber: SEED_ORDER_NUMBER,
      customerId:  userDoc._id,
      items: [
        {
          productId: firstProduct._id,
          name:      firstProduct.name,
          sku:       firstProduct.sku,
          qty:       1,
          price:     firstProduct.price,
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
      payment:  { method: 'COD', provider: 'cod', status: 'pending' },
      status:   'confirmed',
      subtotal: firstProduct.price,
      total:    firstProduct.price,
      notes:    'Seed order for testing',
      statusHistory: [
        { status: 'placed',    changedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
        { status: 'confirmed', changedAt: now },
      ],
    });
    console.log(`✓ Order       : ${SEED_ORDER_NUMBER} created`);
  } else {
    console.log(`✓ Order       : ${existingOrder ? SEED_ORDER_NUMBER + ' already exists' : 'skipped (product not found)'}`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const [colCount, prodCount, pinCount, uCount, aCount, oCount, lCount] =
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
  console.log(`  Users       : ${uCount}`);
  console.log(`  Admins      : ${aCount}`);
  console.log(`  Orders      : ${oCount}`);
  console.log(`  Lookbook    : ${lCount}`);
  console.log('───────────────────────────────────────────────────');
  console.log('  Customer login : customer@vc-sarees.com / Test@12345');
  if (adminEmail) console.log(`  Admin login    : ${adminEmail} / (your SEED_ADMIN_PASSWORD)`);
  console.log('  Product images : upload via admin panel (images: [] in seed)\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
