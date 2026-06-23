# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cart-checkout.spec.ts >> Cart & Checkout >> golden path — add to bag then complete COD checkout
- Location: tests/e2e/cart-checkout.spec.ts:50:7

# Error details

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "http://localhost:3000/products/kandangi-earth-check-weave", waiting until "load"

```

```
Error: write EPIPE
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const PRODUCT_SLUG = 'kandangi-earth-check-weave';
  4  | 
  5  | test.describe('Cart & Checkout', () => {
  6  |   test('add to bag opens cart drawer', async ({ page }) => {
  7  |     await page.goto(`/products/${PRODUCT_SLUG}`);
  8  |     await page.getByRole('button', { name: 'Add to Bag' }).click();
  9  |     // Cart drawer should open — it has "Your Bag" heading
  10 |     await expect(page.getByText('Your Bag')).toBeVisible({ timeout: 5000 });
  11 |     // Item count badge > 0
  12 |     await expect(page.locator('text=1 item').or(page.locator('[aria-label="Cart"]')).first()).toBeVisible();
  13 |   });
  14 | 
  15 |   test('cart shows added item with name and price', async ({ page }) => {
  16 |     await page.goto(`/products/${PRODUCT_SLUG}`);
  17 |     await page.getByRole('button', { name: 'Add to Bag' }).click();
  18 |     await expect(page.getByText('Your Bag')).toBeVisible({ timeout: 5000 });
  19 |     // Product name appears in drawer
  20 |     const itemName = page.locator('[class*="itemName"], [class*="item-name"]').first();
  21 |     await expect(itemName).toBeVisible();
  22 |   });
  23 | 
  24 |   test('cart quantity increment works', async ({ page }) => {
  25 |     await page.goto(`/products/${PRODUCT_SLUG}`);
  26 |     await page.getByRole('button', { name: 'Add to Bag' }).click();
  27 |     await expect(page.getByText('Your Bag')).toBeVisible({ timeout: 5000 });
  28 |     // Click the + button
  29 |     const plusBtn = page.locator('button').filter({ hasText: '+' }).first();
  30 |     await plusBtn.click();
  31 |     await expect(page.locator('text=2').first()).toBeVisible({ timeout: 3000 });
  32 |   });
  33 | 
  34 |   test('remove item empties cart', async ({ page }) => {
  35 |     await page.goto(`/products/${PRODUCT_SLUG}`);
  36 |     await page.getByRole('button', { name: 'Add to Bag' }).click();
  37 |     await expect(page.getByText('Your Bag')).toBeVisible({ timeout: 5000 });
  38 |     // Remove button (×)
  39 |     const removeBtn = page.locator('button[aria-label^="Remove"]').first();
  40 |     await removeBtn.click();
  41 |     await expect(page.getByText('Your bag is empty')).toBeVisible({ timeout: 3000 });
  42 |   });
  43 | 
  44 |   test('empty cart shows empty state on checkout', async ({ page }) => {
  45 |     await page.goto('/checkout');
  46 |     // Should show empty bag message (no items in Zustand store on fresh page)
  47 |     await expect(page.getByText(/empty/i).first()).toBeVisible({ timeout: 5000 });
  48 |   });
  49 | 
  50 |   test('golden path — add to bag then complete COD checkout', async ({ page }) => {
> 51 |     await page.goto(`/products/${PRODUCT_SLUG}`);
     |     ^ Error: write EPIPE
  52 |     await page.getByRole('button', { name: 'Add to Bag' }).click();
  53 |     await expect(page.getByText('Your Bag')).toBeVisible({ timeout: 5000 });
  54 | 
  55 |     // Navigate to checkout
  56 |     await page.goto('/checkout');
  57 |     await expect(page.locator('text=Delivery Address').or(page.locator('text=Address')).first()).toBeVisible({ timeout: 8000 });
  58 | 
  59 |     // Fill address form
  60 |     await page.locator('input[type="email"]').fill('test@example.com');
  61 |     await page.locator('input[placeholder*="name" i], input[placeholder*="Name"]').first().fill('Test User');
  62 |     await page.locator('input[type="tel"], input[placeholder*="phone" i]').fill('9876543210');
  63 |     await page.locator('input[placeholder*="House" i], input[placeholder*="Street" i], input[placeholder*="Area" i]').fill('123 Test Street, Anna Nagar');
  64 |     await page.locator('input[placeholder*="City" i]').fill('Bengaluru');
  65 |     await page.locator('input[maxlength="6"], input[placeholder*="pincode" i]').fill('560011');
  66 | 
  67 |     // State select
  68 |     const stateSelect = page.locator('select').first();
  69 |     await stateSelect.selectOption('Karnataka');
  70 | 
  71 |     // Proceed to step 2
  72 |     await page.getByRole('button', { name: 'Continue to Payment' }).click();
  73 | 
  74 |     // Step 2 — Payment (COD)
  75 |     await expect(page.locator('text=Cash on Delivery').first()).toBeVisible({ timeout: 5000 });
  76 |     await page.getByRole('button', { name: 'Review Order' }).click();
  77 | 
  78 |     // Step 3 — Review & Place Order
  79 |     await expect(page.locator('text=Review').first()).toBeVisible({ timeout: 5000 });
  80 |     await page.getByRole('button', { name: 'Place Order' }).click();
  81 | 
  82 |     // Order confirmation page
  83 |     await expect(page).toHaveURL(/orders\//, { timeout: 15000 });
  84 |     await expect(page.locator('text=VC-').first()).toBeVisible({ timeout: 10000 });
  85 |   });
  86 | });
  87 | 
```