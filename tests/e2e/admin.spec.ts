import { test, expect, type Page } from '@playwright/test';

const ADMIN_EMAIL    = process.env.SEED_ADMIN_EMAIL    ?? '';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? '';

async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login');
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 10000 });
  // Full page reload so the server-side auth() picks up the session cookie
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');
}

test.describe('Admin — Login', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('text=Atelier Admin').or(page.locator('text=Admin')).first()).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('wrong credentials shows error', async ({ page }) => {
    await page.goto('/admin/login');
    await page.locator('input[type="email"]').fill('wrong@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.locator('text=Invalid').or(page.locator('text=incorrect').or(page.locator('[class*="error"]'))).first()).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/admin\/login/);
  });

  test('correct credentials logs in and redirects to dashboard', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.locator('text=Dashboard').or(page.locator('text=Revenue').or(page.locator('text=Orders'))).first()).toBeVisible({ timeout: 8000 });
  });
});

test.describe('Admin — Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('dashboard shows metric cards', async ({ page }) => {
    const metrics = page.locator('[class*="metric"], [class*="Metric"]');
    await expect(metrics.first()).toBeVisible({ timeout: 8000 });
  });

  test('sidebar navigation links visible', async ({ page }) => {
    await expect(page.locator('a[href="/admin/products"]').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('a[href="/admin/orders"]').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('a[href="/admin/customers"]').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Admin — Products', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('product list page loads with table', async ({ page }) => {
    await page.goto('/admin/products');
    await expect(page.locator('table, [class*="table"]').first()).toBeVisible({ timeout: 8000 });
    // Should show seeded products
    await expect(page.locator('text=Ilkal').first()).toBeVisible({ timeout: 8000 });
  });

  test('new product form has all required fields', async ({ page }) => {
    await page.goto('/admin/products/new');
    await expect(page.locator('input[placeholder*="Lakshmi"]').first()).toBeVisible({ timeout: 8000 });
    await expect(page.locator('input[placeholder*="VC-KANJ"]').first()).toBeVisible();
    await expect(page.locator('input[placeholder*="48500"]').first()).toBeVisible();
  });

  test('create new product saves and redirects to product list', async ({ page }) => {
    await page.goto('/admin/products/new');
    // Wait for collections to load into the select (fetched via useEffect)
    await page.waitForFunction(
      () => (document.querySelector('select') as HTMLSelectElement)?.options.length > 1,
      { timeout: 10000 }
    );

    // Fill all required fields
    await page.locator('input[placeholder*="Lakshmi"]').fill(`Test Silk Saree ${Date.now()}`);
    await page.locator('input[placeholder*="VC-KANJ"]').fill(`TEST-SKU-${Date.now()}`);

    // Collection — pick first real option (index 0 is "Select collection…")
    await page.locator('select').first().selectOption({ index: 1 });

    await page.locator('input[placeholder*="48500"]').fill('25000');
    await page.locator('input[placeholder="e.g. 1"]').fill('5');
    await page.locator('textarea[placeholder*="Short product"]').fill('A beautiful test silk saree.');

    // Submit and wait for success message then redirect
    await page.getByRole('button', { name: /create product|save/i }).click();
    await expect(page.locator('text=Product saved successfully')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/admin\/products$/, { timeout: 15000 });
  });
});

test.describe('Admin — Orders', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('orders list page loads', async ({ page }) => {
    await page.goto('/admin/orders');
    await expect(page.locator('table, [class*="table"]').first()).toBeVisible({ timeout: 8000 });
  });

  test('order detail page loads', async ({ page }) => {
    await page.goto('/admin/orders');
    // Click first order row link
    const firstOrderLink = page.locator('a[href*="/admin/orders/"]').first();
    await expect(firstOrderLink).toBeVisible({ timeout: 8000 });
    await firstOrderLink.click();
    await expect(page).toHaveURL(/\/admin\/orders\/.+/);
    await expect(page.locator('text=VC-').first()).toBeVisible({ timeout: 8000 });
  });

  test('order status can be updated', async ({ page }) => {
    await page.goto('/admin/orders');
    const firstOrderLink = page.locator('a[href*="/admin/orders/"]').first();
    await firstOrderLink.click();
    await page.waitForLoadState('networkidle');

    // Status select — pick a value different from the current one so button is enabled
    const statusSelect = page.locator('select').first();
    await expect(statusSelect).toBeVisible({ timeout: 8000 });
    const current = await statusSelect.inputValue();
    const next = current === 'confirmed' ? 'shipped' : 'confirmed';
    await statusSelect.selectOption(next);

    const updateBtn = page.getByRole('button', { name: /update status/i }).first();
    await expect(updateBtn).toBeEnabled({ timeout: 3000 });
    await updateBtn.click();
    await expect(page.locator(`text=${next}`).first()).toBeVisible({ timeout: 8000 });
  });
});

test.describe('Admin — Inventory & Reports', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('inventory page lists products by stock', async ({ page }) => {
    await page.goto('/admin/inventory');
    await expect(page.locator('table, [class*="table"]').first()).toBeVisible({ timeout: 8000 });
  });

  test('reports page renders revenue metrics', async ({ page }) => {
    await page.goto('/admin/reports');
    await expect(page.locator('text=Revenue').or(page.locator('text=Orders')).first()).toBeVisible({ timeout: 8000 });
  });
});
