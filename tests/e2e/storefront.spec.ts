import { test, expect } from '@playwright/test';

const COLLECTION_SLUG = 'ilkal-silk';
const PRODUCT_SLUG    = 'ilkal-kasuti-border-silk';

test.describe('Storefront — Page Renders', () => {
  test('home page loads with hero and collections', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/VC/);
    // Hero section present
    await expect(page.locator('text=Woven in gold').or(page.locator('text=Bridal')).first()).toBeVisible({ timeout: 10000 });
    // Nav logo
    await expect(page.locator('text=VC').first()).toBeVisible();
  });

  test('collection page loads product grid', async ({ page }) => {
    await page.goto(`/collections/${COLLECTION_SLUG}`);
    // At least one product card rendered
    const cards = page.locator('a[href^="/products/"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('sort select updates URL', async ({ page }) => {
    await page.goto(`/collections/${COLLECTION_SLUG}`);
    await page.waitForLoadState('networkidle');
    const select = page.locator('select').first();
    await select.selectOption('price-asc');
    await expect(page).toHaveURL(/sort=price-asc/);
  });

  test('PDP loads with product name and price', async ({ page }) => {
    await page.goto(`/products/${PRODUCT_SLUG}`);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    // Price element visible
    await expect(page.locator('.price').first()).toBeVisible();
    // "Add to Bag" button present
    await expect(page.getByRole('button', { name: 'Add to Bag' })).toBeVisible();
  });

  test('PDP pincode check — valid seeded pincode', async ({ page }) => {
    await page.goto(`/products/${PRODUCT_SLUG}`);
    const input = page.locator('input[inputmode="numeric"], input[placeholder*="pincode"], input[maxlength="6"]').first();
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.fill('560011');
    await page.getByRole('button', { name: /check/i }).click();
    await expect(page.locator('text=deliverable').or(page.locator('text=days')).first()).toBeVisible({ timeout: 8000 });
  });

  test('PDP pincode check — unserviceable pincode', async ({ page }) => {
    await page.goto(`/products/${PRODUCT_SLUG}`);
    const input = page.locator('input[inputmode="numeric"], input[placeholder*="pincode"], input[maxlength="6"]').first();
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.fill('999999');
    await page.getByRole('button', { name: /check/i }).click();
    await expect(page.locator('text=not').or(page.locator('text=Sorry')).first()).toBeVisible({ timeout: 8000 });
  });

  test('404 — nonexistent collection returns 404 page', async ({ page }) => {
    const response = await page.goto('/collections/nonexistent-xyz');
    expect(response?.status()).toBe(404);
  });

  test('404 — nonexistent product returns 404 page', async ({ page }) => {
    const response = await page.goto('/products/nonexistent-xyz');
    expect(response?.status()).toBe(404);
  });
});
