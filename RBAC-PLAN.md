# Plan: Role-Based Access Control for Admin Panel

## Context
The admin panel currently has two roles defined in the `Admin` model (`'super'` | `'manager'`) and the role is already stored in the JWT/session, but **no functional differentiation exists** — every admin sees every page and can do every action. The user wants:
- **Super admin**: full access + can manage other admin accounts
- **Manager**: everything except Reports and Settings (hidden + API-blocked)
- A new `/admin/admins` page where super admin can create/delete admin accounts

---

## What Already Works (no changes needed)
- `lib/models/Admin.ts` — schema already has `role: 'super' | 'manager'`
- `lib/auth.ts` — `session.user.role` already carries the role through JWT/session
- `proxy.ts` — binary `isAdmin` check is sufficient; page-level guards will handle role granularity

---

## Changes Required

### 1. AdminSidebar — filter nav by role
**File:** `components/admin/AdminSidebar.tsx`

- Read `session.user.role` from `useSession()`
- Add a `roles` field to each nav item: `roles: ('super' | 'manager')[]`
- Filter: hide **Reports** and **Settings** for `'manager'`; hide nothing for `'super'`
- Add a new nav item **"Admins"** (`/admin/admins`) visible only to `'super'`
- Display the actual role label ("Super" / "Manager") instead of hardcoded "Admin"

### 2. Reports page — role guard
**File:** `app/(admin)/admin/reports/page.tsx`

- Add `auth()` call at the top of the server component
- If `session?.user?.role !== 'super'`, call `redirect('/admin')` with a toast/query param indicating "Access denied"

### 3. Settings page — role guard
**File:** `app/(admin)/admin/settings/page.tsx`

- Same pattern: check `role === 'super'`, redirect to `/admin` if not

### 4. Settings API — role guard
**File:** `app/api/site-config/route.ts`

- In the `POST` handler, change check from `!isAdmin` → `role !== 'super'`
- Return 403 if manager tries to mutate site config

### 5. New: Admins management page
**New files:**
- `app/(admin)/admin/admins/page.tsx` — list all admins (server component); super-only gate
- `app/(admin)/admin/admins/AdminCreateForm.tsx` — client component: email + password + role (manager/super) form
- `app/(admin)/admin/admins/AdminDeleteButton.tsx` — client component reusing the existing `ConfirmDialog` pattern from `components/admin/ConfirmDialog.tsx`

**Page behaviour:**
- Fetches all admins via `AdminModel.find().select('-passwordHash').lean()`
- Shows table: email, role badge, created date, delete button
- "Create Admin" form inline or in a modal (match existing form style in `components/admin/`)
- Cannot delete yourself (disable delete button if `admin._id === session.user.id`)

### 6. New: Admins API
**New file:** `app/api/admins/route.ts`

- `GET` — list admins (super only), returns `email + role + createdAt`, never `passwordHash`
- `POST` — create admin (super only): validate email uniqueness, hash password with bcrypt (same pattern as `app/api/auth/register/route.ts`), insert with chosen role
- `DELETE /api/admins/[id]` (`app/api/admins/[id]/route.ts`) — delete admin (super only); block self-delete

---

## Permission Matrix

| Section | Super | Manager |
|---|---|---|
| Dashboard | ✅ | ✅ |
| Products | ✅ | ✅ |
| Collections | ✅ | ✅ |
| Inventory | ✅ | ✅ |
| Orders | ✅ | ✅ |
| Customers | ✅ | ✅ |
| Discounts | ✅ | ✅ |
| Lookbook | ✅ | ✅ |
| Reports | ✅ | ❌ hidden + 403 |
| Settings | ✅ | ❌ hidden + 403 |
| Admins | ✅ | ❌ hidden + 403 |

---

## Files to Create / Modify

| File | Action |
|---|---|
| `components/admin/AdminSidebar.tsx` | Modify — role-filtered nav |
| `app/(admin)/admin/reports/page.tsx` | Modify — add role guard |
| `app/(admin)/admin/settings/page.tsx` | Modify — add role guard |
| `app/api/site-config/route.ts` | Modify — POST requires `role === 'super'` |
| `app/(admin)/admin/admins/page.tsx` | Create — list + create admins |
| `app/(admin)/admin/admins/AdminCreateForm.tsx` | Create — form client component |
| `app/(admin)/admin/admins/AdminDeleteButton.tsx` | Create — delete client component |
| `app/api/admins/route.ts` | Create — GET + POST |
| `app/api/admins/[id]/route.ts` | Create — DELETE |

---

## Reuse Patterns
- `ConfirmDialog` from `components/admin/ConfirmDialog.tsx` — reuse for delete confirmation
- bcrypt hash pattern from `app/api/auth/register/route.ts` — reuse for admin creation
- CSS classes and card/table styles from `app/(admin)/admin/customers/page.tsx` — reuse for admins list
- `auth()` + `isAdmin` guard pattern from existing API routes — extend to add `role` check

---

## Verification
1. Log in as a `'manager'` admin → Reports and Settings nav items should not appear; direct URL `/admin/reports` should redirect to `/admin`
2. Log in as a `'super'` admin → all sections visible; `/admin/admins` shows list of admins
3. Super admin creates a new manager account → new admin can log in, sees restricted nav
4. Super admin cannot delete their own account (button disabled)
5. Manager attempts `POST /api/site-config` directly → receives 403
