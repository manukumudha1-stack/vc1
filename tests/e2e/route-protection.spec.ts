import { test, expect } from '@playwright/test';

test.describe('Route Protection', () => {
  test('/admin redirects to /admin/login when unauthenticated', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/admin\/login/, { timeout: 8000 });
  });

  test('/admin/products redirects to /admin/login when unauthenticated', async ({ page }) => {
    await page.goto('/admin/products');
    await expect(page).toHaveURL(/admin\/login/, { timeout: 8000 });
  });

  test('/account redirects to sign-in when unauthenticated', async ({ page }) => {
    await page.goto('/account');
    await expect(page).toHaveURL(/signin|login/, { timeout: 8000 });
  });

  test('/admin/login is publicly accessible', async ({ page }) => {
    const res = await page.goto('/admin/login');
    expect(res?.status()).toBe(200);
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('/auth/signin is publicly accessible', async ({ page }) => {
    const res = await page.goto('/auth/signin');
    expect(res?.status()).toBe(200);
    await expect(page.locator('text=Google').or(page.locator('button')).first()).toBeVisible();
  });
});
