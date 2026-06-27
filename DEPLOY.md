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

| Variable | Description | Required |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string (`mongodb+srv://...`) | ✅ |
| `NEXTAUTH_URL` | Full public URL of the app, e.g. `https://your-domain.vercel.app` | ✅ |
| `NEXTAUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` | ✅ |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID from Google Cloud Console | ✅ |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret from Google Cloud Console | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name (from Dashboard) | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key (from Settings → Access Keys) | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret (from Settings → Access Keys) | ✅ |
| `RESEND_API_KEY` | Resend API key for transactional email | ✅ |
| `ADMIN_ALERT_EMAIL` | Email address that receives new-order admin alerts | ✅ |
| `SEED_ADMIN_EMAIL` | Email for the seeded super-admin account (`npm run seed`) | ✅ for seed |
| `SEED_ADMIN_PASSWORD` | Password for the seeded super-admin account | ✅ for seed |
| `TWILIO_ACCOUNT_SID` | Twilio account SID (WhatsApp fallback, optional) | ⬜ optional |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | ⬜ optional |
| `WATI_API_URL` | WATI API base URL for WhatsApp notifications | ⬜ optional |
| `WATI_API_TOKEN` | WATI API bearer token | ⬜ optional |

> **Note:** `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` are only needed when running `npm run seed` locally or in CI. They do not need to be set in the Vercel production environment.

## 8. Post-deploy verification

- [ ] `/` — homepage renders hero, collections grid, featured products, lookbook
- [ ] `/collections` — collections listing with hero banner
- [ ] `/collections/bridal-kanjivaram` — products grid with filter sidebar
- [ ] `/products/lakshmi-temple-border-kanjivaram` — PDP loads with image gallery
- [ ] Add to bag → cart drawer opens, item shown
- [ ] `/checkout` — redirects to sign-in if not logged in
- [ ] Sign up with email → phone number field required
- [ ] `/checkout` — place a COD order after login → confirmation page
- [ ] `/orders` — order history visible (protected, login required)
- [ ] Admin login at `/admin/login` with seeded credentials
- [ ] `/admin` dashboard shows order counts
- [ ] `/admin/products/new` → upload a real photo → save → appears on collection page
- [ ] `/admin/customers` — customer list with delete button
- [ ] `/admin/lookbook` — lookbook entries manageable
- [ ] Google sign-in creates a User document in Atlas
- [ ] Dark/light theme toggle works; breadcrumb and back button readable in both modes

## 9. Route protection summary

Non-logged-in users can access:
- `/` — homepage
- `/collections/*` — collection browsing
- `/products/*` — product detail pages
- `/auth/signin` — sign-in / register

Redirects to `/auth/signin` (with `callbackUrl`):
- `/checkout`
- `/orders` and `/orders/*`
- `/account` and `/account/*`

Admin routes (`/admin/*`) redirect to `/admin/login` if no admin session.

## 10. PhonePe (when ready)

1. Sign up at developer.phonepe.com
2. Implement `POST /api/payment/phonepay/route.ts` (currently returns 501)
3. Update Order model `payment.provider` to `'phonepay'`
4. The checkout UI already has a disabled "Pay online" button — enable it

## File structure summary

```
vc1/
├ app/
│  ├ (store)/          # customer-facing pages
│  │  ├ page.tsx       # homepage
│  │  ├ collections/   # /collections + /collections/[slug]
│  │  ├ products/      # /products/[slug]
│  │  ├ checkout/      # COD checkout (login required)
│  │  ├ orders/        # order history + detail (login required)
│  │  ├ account/       # account page (login required)
│  │  └ lookbook/      # lookbook gallery
│  ├ (admin)/          # admin panel (/admin/*)
│  │  ├ admin/products/
│  │  ├ admin/collections/
│  │  ├ admin/orders/
│  │  ├ admin/customers/   # includes delete customer
│  │  ├ admin/lookbook/
│  │  ├ admin/inventory/
│  │  ├ admin/discounts/
│  │  └ admin/reports/
│  ├ api/              # all Route Handlers
│  │  ├ auth/          # register (phone required), forgot-password, reset-password
│  │  ├ products/
│  │  ├ collections/
│  │  ├ orders/
│  │  ├ customers/     # GET + DELETE (admin only)
│  │  ├ lookbook/
│  │  └ upload/
│  └ auth/signin/      # sign-in / register / forgot-password (single page, multi-view)
├ components/
│  ├ store/            # Nav (breadcrumb + back btn), Footer, CartDrawer,
│  │                   # ProductCard, FilterSidebar, GalleryClient, …
│  └ admin/            # AdminSidebar, ProductForm, CollectionForm,
│                      # LookbookForm, ConfirmDialog, MetricCard
├ lib/
│  ├ db.ts             # Mongoose connect singleton
│  ├ auth.ts           # NextAuth options + auth() helper
│  ├ cloudinary.ts     # upload signature generator
│  ├ notifications.ts  # Resend + WATI
│  ├ utils.ts          # formatINR, slugify, generateOrderNumber
│  └ models/           # 10 Mongoose models:
│                      # User, Admin, Product, Collection, Order,
│                      # Lookbook, Discount, ServiceablePincode,
│                      # PasswordReset, SiteConfig
├ store/cart.ts         # Zustand cart + drawer state
├ proxy.ts             # Route protection middleware
├ scripts/seed.ts      # One-time DB seed
└ .env.local.example   # All required env vars
```
