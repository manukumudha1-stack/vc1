# VC Sarees — Deploy Checklist

## 1. MongoDB Atlas (free M0 tier)

1. Create account at cloud.mongodb.com
2. New Project → New Cluster → M0 Free
3. Database Access → Add user (password auth)
4. Network Access → Add `0.0.0.0/0` (Vercel uses dynamic IPs)
5. Connect → Drivers → copy the `mongodb+srv://...` URI
6. Set `MONGODB_URI` in `.env.local` and Vercel env vars

## 2. Google OAuth

1. console.cloud.google.com → New Project
2. APIs & Services → Credentials → Create OAuth Client ID
3. Application type: Web
4. Authorised redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://your-domain.vercel.app/api/auth/callback/google` (prod)
5. Copy Client ID → `GOOGLE_CLIENT_ID`
6. Copy Client Secret → `GOOGLE_CLIENT_SECRET`

## 3. Cloudinary (free tier)

1. cloudinary.com → sign up → Dashboard
2. Copy Cloud Name → `CLOUDINARY_CLOUD_NAME`
3. Settings → Access Keys → copy API Key + Secret
4. Set `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`

## 4. Resend (email)

1. resend.com → sign up → API Keys → Create key
2. Set `RESEND_API_KEY`
3. Domains → verify your sending domain (or use `onboarding@resend.dev` for testing)
4. Set `ADMIN_ALERT_EMAIL` to the store manager's email

## 5. WATI (WhatsApp) — optional for v1

1. wati.io → sign up → get API URL + Token
2. Set `WATI_API_URL` and `WATI_API_TOKEN`
3. If not ready, leave blank — notifications will be skipped gracefully

## 6. Seed the database

```bash
cp .env.local.example .env.local
# fill in MONGODB_URI, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
npm run seed
```

This creates 4 collections, 9 products, 10 pincodes, and 1 admin user.

## 7. Deploy to Vercel

```bash
npm i -g vercel
vercel
# follow prompts, link to your Git repo
```

Or push to GitHub → import on vercel.com → set all env vars in dashboard.

### Required env vars on Vercel:

```
MONGODB_URI
NEXTAUTH_URL          # https://your-domain.vercel.app
NEXTAUTH_SECRET       # run: openssl rand -base64 32
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
RESEND_API_KEY
ADMIN_ALERT_EMAIL
```

Optional (WhatsApp):
```
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
WATI_API_URL
WATI_API_TOKEN
```

## 8. Post-deploy verification

- [ ] `/` — homepage renders with VC branding
- [ ] `/collections/bridal-kanjivaram` — 9 seeded products show
- [ ] `/products/lakshmi-temple-border-kanjivaram` — PDP loads
- [ ] Add to bag → cart drawer opens, item shown
- [ ] `/checkout` — place a COD order → confirmation page
- [ ] Admin login at `/admin/login` with seeded credentials
- [ ] `/admin` dashboard shows order counts
- [ ] `/admin/products/new` → upload a real photo → save → appears on collection page
- [ ] Google sign-in creates a User document in Atlas

## 9. PhonePe (when ready)

1. Sign up at developer.phonepe.com
2. Implement `POST /api/payment/phonepay/route.ts` (currently returns 501)
3. Update Order model `payment.provider` to `'phonepay'`
4. The checkout UI already has a disabled "Pay online" button — enable it

## File structure summary

```
vc1/
├ app/
│  ├ (store)/          # customer-facing pages (/, /collections, /products, /checkout)
│  ├ (admin)/          # admin panel (/admin/*)
│  ├ api/              # all Route Handlers
│  └ auth/signin/      # Google sign-in page
├ components/
│  ├ store/            # Nav, Footer, CartDrawer, ProductCard, FilterSidebar, …
│  └ admin/            # AdminSidebar, MetricCard, ProductForm
├ lib/
│  ├ db.ts             # Mongoose connect singleton
│  ├ auth.ts           # NextAuth options + auth() helper
│  ├ cloudinary.ts     # upload signature generator
│  ├ notifications.ts  # Resend + WATI
│  ├ utils.ts          # formatINR, slugify, generateOrderNumber
│  └ models/           # 7 Mongoose models
├ store/cart.ts         # Zustand cart + drawer state
├ proxy.ts             # Route protection (Next.js 16 proxy)
├ scripts/seed.ts      # One-time DB seed
└ .env.local.example   # All required env vars
```
