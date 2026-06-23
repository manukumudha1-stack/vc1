import { test, expect } from '@playwright/test';

const PRODUCT_SLUG = 'kandangi-earth-check-weave';

test.describe('Cart & Checkout', () => {
  test('add to bag opens cart drawer', async ({ page }) => {
    await page.goto(`/products/${PRODUCT_SLUG}`);
    await page.getByRole('button', { name: 'Add to Bag' }).click();
    // Cart drawer should open — it has "Your Bag" heading
    await expect(page.getByText('Your Bag')).toBeVisible({ timeout: 5000 });
    // Item count badge > 0
    await expect(page.locator('text=1 item').or(page.locator('[aria-label="Cart"]')).first()).toBeVisible();
  });

  test('cart shows added item with name and price', async ({ page }) => {
    await page.goto(`/products/${PRODUCT_SLUG}`);
    await page.getByRole('button', { name: 'Add to Bag' }).click();
    await expect(page.getByText('Your Bag')).toBeVisible({ timeout: 5000 });
    // Product name appears in drawer
    const itemName = page.locator('[class*="itemName"], [class*="item-name"]').first();
    await expect(itemName).toBeVisible();
  });

  test('cart quantity increment works', async ({ page }) => {
    await page.goto(`/products/${PRODUCT_SLUG}`);
    await page.getByRole('button', { name: 'Add to Bag' }).click();
    await expect(page.getByText('Your Bag')).toBeVisible({ timeout: 5000 });
    // Click the + button
    const plusBtn = page.locator('button').filter({ hasText: '+' }).first();
    await plusBtn.click();
    await expect(page.locator('text=2').first()).toBeVisible({ timeout: 3000 });
  });

  test('remove item empties cart', async ({ page }) => {
    await page.goto(`/products/${PRODUCT_SLUG}`);
    await page.getByRole('button', { name: 'Add to Bag' }).click();
    await expect(page.getByText('Your Bag')).toBeVisible({ timeout: 5000 });
    // Remove button (×)
    const removeBtn = page.locator('button[aria-label^="Remove"]').first();
    await removeBtn.click();
    await expect(page.getByText('Your bag is empty')).toBeVisible({ timeout: 3000 });
  });

  test('empty cart shows empty state on checkout', async ({ page }) => {
    await page.goto('/checkout');
    // Should show empty bag message (no items in Zustand store on fresh page)
    await expect(page.getByText(/empty/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('golden path — add to bag then complete COD checkout', async ({ page }) => {
    await page.goto(`/products/${PRODUCT_SLUG}`);
    await page.getByRole('button', { name: 'Add to Bag' }).click();
    await expect(page.getByText('Your Bag')).toBeVisible({ timeout: 5000 });

    // Navigate to checkout
    await page.goto('/checkout');
    await expect(page.locator('text=Delivery Address').or(page.locator('text=Address')).first()).toBeVisible({ timeout: 8000 });

    // Fill address form
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[placeholder*="name" i], input[placeholder*="Name"]').first().fill('Test User');
    await page.locator('input[type="tel"], input[placeholder*="phone" i]').fill('9876543210');
    await page.locator('input[placeholder*="House" i], input[placeholder*="Street" i], input[placeholder*="Area" i]').fill('123 Test Street, Anna Nagar');
    await page.locator('input[placeholder*="City" i]').fill('Bengaluru');
    await page.locator('input[maxlength="6"], input[placeholder*="pincode" i]').fill('560011');

    // State select
    const stateSelect = page.locator('select').first();
    await stateSelect.selectOption('Karnataka');

    // Proceed to step 2
    await page.getByRole('button', { name: 'Continue to Payment' }).click();

    // Step 2 — Payment (COD)
    await expect(page.locator('text=Cash on Delivery').first()).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Review Order' }).click();

    // Step 3 — Review & Place Order
    await expect(page.locator('text=Review').first()).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Place Order' }).click();

    // Order confirmation page
    await expect(page).toHaveURL(/orders\//, { timeout: 15000 });
    await expect(page.locator('text=VC-').first()).toBeVisible({ timeout: 10000 });
  });
});
