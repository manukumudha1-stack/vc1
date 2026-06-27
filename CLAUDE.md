# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build
npm run lint         # Run ESLint
npm run seed         # Seed MongoDB (4 collections, 9 products, 10 pincodes, 1 admin)
npm run test:e2e     # Run Playwright E2E tests (requires running dev server)
npm run test:e2e:ui  # Playwright interactive UI mode
```

## Environment

Copy `.env.local.example` to `.env.local`. Required variables:
- `MONGODB_URI` — MongoDB Atlas connection string
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET` — NextAuth config
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — OAuth
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — image hosting
- `RESEND_API_KEY` — transactional email
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` — used by `npm run seed`

Twilio and WATI variables are optional (WhatsApp notifications).

## Architecture

### Route Groups

- `app/(store)/` — public customer-facing storefront; layout includes Nav, Footer, CartDrawer
- `app/(admin)/` — protected admin panel; layout includes AdminSidebar
- `app/api/` — RESTful Route Handlers for all data operations
- `app/auth/` — sign-in and password-reset UI pages

Route protection is enforced in `proxy.ts` (Next.js middleware) — `/admin/*` requires an Admin session, `/account/*` requires a User session.

### Data Layer

All models live in `lib/models/`. Two separate user types share no schema:
- `User.ts` — customer accounts (Google OAuth or email/password)
- `Admin.ts` — staff accounts with `role: 'owner' | 'manager'`

`lib/db.ts` exports a Mongoose connection singleton; always import it before querying.

### State Management

Zustand cart store (`store/cart.ts`) is the only client-side global state. It tracks cart items and the open/closed state of the CartDrawer. Server components pass initial data as props; the cart store handles mutations.

### Image Uploads

All product images are hosted on Cloudinary. The upload flow goes through `app/api/upload/` which returns a signed upload signature; the client then uploads directly to Cloudinary. Never store images in the repo or public folder.

### Notifications

`lib/notifications.ts` sends order confirmations via Resend (email) and optionally WATI (WhatsApp). This is called from order creation API routes after the order document is saved.

### Payment

Only COD (Cash on Delivery) is implemented. `app/api/payment/phonepay/` is a 501 stub — do not treat it as functional.

### TypeScript Path Alias

`@/*` maps to the repo root. Use `@/lib/...`, `@/components/...`, etc. for all internal imports.

### Testing

Playwright E2E tests in `tests/e2e/` cover the full customer and admin flows. `tests/global-setup.ts` seeds the database before the test suite runs — do not run tests against a production database.
