# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cart-checkout.spec.ts >> Cart & Checkout >> cart quantity increment works
- Location: tests/e2e/cart-checkout.spec.ts:24:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/products/kandangi-earth-check-weave", waiting until "load"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e2]:
    - generic [ref=e3]:
      - list
      - link "VC — Home" [ref=e4] [cursor=pointer]:
        - /url: /
        - generic [ref=e5]: VC
      - generic [ref=e6]:
        - button "Search" [ref=e7] [cursor=pointer]:
          - img [ref=e8]
        - button "Toggle theme" [ref=e11] [cursor=pointer]:
          - img [ref=e12]
        - link "Account" [ref=e14] [cursor=pointer]:
          - /url: /account
          - img [ref=e15]
        - button "Cart" [ref=e18] [cursor=pointer]:
          - img [ref=e19]
  - generic [ref=e22]:
    - generic [ref=e23]:
      - generic [ref=e24]: VC
      - button "Close menu" [ref=e25] [cursor=pointer]:
        - img [ref=e26]
    - navigation [ref=e29]:
      - link "Collections" [ref=e30] [cursor=pointer]:
        - /url: /collections
      - link "Account" [ref=e31] [cursor=pointer]:
        - /url: /account
  - main [ref=e32]:
    - generic [ref=e33]:
      - generic [ref=e34]:
        - link "Home" [ref=e35] [cursor=pointer]:
          - /url: /
        - generic [ref=e36]: ›
        - link "Mix Silk" [ref=e37] [cursor=pointer]:
          - /url: /collections/mix-silk
        - generic [ref=e38]: ›
        - generic [ref=e39]: Kandangi Earth-Check Weave
      - generic [ref=e40]:
        - generic [ref=e42]:
          - generic [ref=e43]:
            - button "Full drape — terracotta and ecru check" [ref=e44] [cursor=pointer]:
              - img "Full drape — terracotta and ecru check" [ref=e46]
            - button "Kandangi large check pattern close-up" [ref=e47] [cursor=pointer]:
              - img "Kandangi large check pattern close-up" [ref=e49]
            - button "Copper zari border detail" [ref=e50] [cursor=pointer]:
              - img "Copper zari border detail" [ref=e52]
            - button "Cotton-silk blend texture" [ref=e53] [cursor=pointer]:
              - img "Cotton-silk blend texture" [ref=e55]
          - generic [ref=e56]:
            - generic [ref=e57]:
              - img "Full drape — terracotta and ecru check" [ref=e58]
              - generic [ref=e59]: Full drape — terracotta and ecru check
            - button "Previous image" [ref=e60] [cursor=pointer]:
              - img [ref=e61]
            - button "Next image" [ref=e63] [cursor=pointer]:
              - img [ref=e64]
        - generic [ref=e66]:
          - generic [ref=e67]: Karaikudi, Sivaganga District, Tamil Nadu
          - heading "Kandangi Earth-Check Weave" [level=1] [ref=e68]
          - generic [ref=e69]:
            - generic [ref=e70]: Cotton Silk
            - generic [ref=e71]: Copper Zari
            - generic [ref=e72]: Daily Wear
            - generic [ref=e73]: Festival
          - paragraph [ref=e74]: ₹ 14,200
          - paragraph [ref=e75]: A relaxed daily-wear saree in the classic Kandangi large-check pattern — earthy terracotta and ecru checks woven in a soft cotton-silk blend with a copper zari line at each check border. The body is light enough for all-day wear while the copper zari gives it a quiet shimmer suited for festivals. The self-woven border in terracotta and copper is two inches wide. The saree drapes effortlessly and requires no pleating tricks.
          - generic [ref=e76]:
            - button "Add to Bag" [ref=e77] [cursor=pointer]
            - button "Add to wishlist" [ref=e78] [cursor=pointer]:
              - img [ref=e79]
          - table [ref=e81]:
            - rowgroup [ref=e82]:
              - row "Fabric Cotton Silk" [ref=e83]:
                - cell "Fabric" [ref=e84]
                - cell "Cotton Silk" [ref=e85]
              - row "Zari Copper Zari" [ref=e86]:
                - cell "Zari" [ref=e87]
                - cell "Copper Zari" [ref=e88]
              - row "Blouse Piece Not included" [ref=e89]:
                - cell "Blouse Piece" [ref=e90]
                - cell "Not included" [ref=e91]
              - row "Weaver Karaikudi Handlooms" [ref=e92]:
                - cell "Weaver" [ref=e93]
                - cell "Karaikudi Handlooms" [ref=e94]
          - generic [ref=e95]:
            - paragraph [ref=e96]: Check delivery availability
            - generic [ref=e97]:
              - textbox "Delivery pincode" [ref=e98]:
                - /placeholder: Enter 6-digit pincode
              - button "Check" [disabled] [ref=e99]
          - generic [ref=e100]:
            - button "Care Instructions" [ref=e102] [cursor=pointer]:
              - generic [ref=e103]: Care Instructions
              - img [ref=e104]
            - button "Fabric & Weave" [ref=e107] [cursor=pointer]:
              - generic [ref=e108]: Fabric & Weave
              - img [ref=e109]
            - button "Shipping & Returns" [ref=e112] [cursor=pointer]:
              - generic [ref=e113]: Shipping & Returns
              - img [ref=e114]
      - generic [ref=e116]:
        - generic [ref=e117]:
          - paragraph [ref=e118]: The story behind
          - heading "Maker's Note" [level=2] [ref=e119]
          - paragraph [ref=e120]: Kandangi is a village near Karaikudi in the Sivaganga district of Tamil Nadu — the heartland of the Chettinad region. The Chettinad check saree takes its name from here and was originally woven for the women of the Nattukotai Chettiars, a mercantile community whose elaborate mansions and rich textile tradition define the region. The large bold check is distinctive to Kandangi — most Chettinad sarees use a smaller check — and the copper zari border is a regional signature not found in check sarees from other weaving centres.
        - generic [ref=e122]: Kandangi Earth-Check Weave — Detail
      - generic [ref=e123]:
        - generic [ref=e124]:
          - paragraph [ref=e125]: From the same collection
          - heading "You may also love" [level=2] [ref=e126]
        - generic [ref=e127]:
          - article [ref=e128]:
            - link [ref=e129] [cursor=pointer]:
              - /url: /products/champagne-mysore-silk-crepe
              - generic [ref=e131]: Champagne Mysore Silk Crepe
            - button "Add to wishlist" [ref=e133] [cursor=pointer]:
              - img [ref=e134]
            - generic [ref=e136]:
              - generic [ref=e137]: Only 3 left
              - link "Champagne Mysore Silk Crepe" [ref=e138] [cursor=pointer]:
                - /url: /products/champagne-mysore-silk-crepe
                - heading "Champagne Mysore Silk Crepe" [level=3] [ref=e139]
              - paragraph [ref=e140]: Mysuru, Karnataka
              - generic [ref=e141]:
                - generic [ref=e142]: ₹ 22,900
                - generic [ref=e143]: Mysore Silk Crepe
          - article [ref=e144]:
            - link [ref=e145] [cursor=pointer]:
              - /url: /products/pochampally-double-ikat-saree
              - generic [ref=e147]: Pochampally Double Ikat Saree
            - button "Add to wishlist" [ref=e149] [cursor=pointer]:
              - img [ref=e150]
            - generic [ref=e152]:
              - generic [ref=e153]: Only 2 left
              - link "Pochampally Double Ikat Saree" [ref=e154] [cursor=pointer]:
                - /url: /products/pochampally-double-ikat-saree
                - heading "Pochampally Double Ikat Saree" [level=3] [ref=e155]
              - paragraph [ref=e156]: Bhoodan Pochampally, Nalgonda District, Telangana
              - generic [ref=e157]:
                - generic [ref=e158]: ₹ 31,750
                - generic [ref=e159]: Pure Silk
  - contentinfo [ref=e160]:
    - generic [ref=e161]:
      - generic [ref=e162]:
        - generic [ref=e163]:
          - generic [ref=e164]: VC
          - paragraph [ref=e165]:
            - text: Woven in gold.
            - text: Worn through generations.
          - link "WhatsApp us" [ref=e166] [cursor=pointer]:
            - /url: https://wa.me/919999999999
            - img [ref=e167]
            - text: WhatsApp us
        - generic [ref=e169]:
          - heading "Shop" [level=4] [ref=e170]
          - list [ref=e171]:
            - listitem [ref=e172]:
              - link "Ilkal Silk" [ref=e173] [cursor=pointer]:
                - /url: /collections/ilkal-silk
            - listitem [ref=e174]:
              - link "Paithani Silk" [ref=e175] [cursor=pointer]:
                - /url: /collections/paithani-silk
            - listitem [ref=e176]:
              - link "Gadwal Silk" [ref=e177] [cursor=pointer]:
                - /url: /collections/gadwal-silk
            - listitem [ref=e178]:
              - link "Mix Silk" [ref=e179] [cursor=pointer]:
                - /url: /collections/mix-silk
            - listitem [ref=e180]:
              - link "All Collections" [ref=e181] [cursor=pointer]:
                - /url: /collections
        - generic [ref=e182]:
          - heading "The House" [level=4] [ref=e183]
          - list [ref=e184]:
            - listitem [ref=e185]:
              - link "Our Story" [ref=e186] [cursor=pointer]:
                - /url: /heritage
            - listitem [ref=e187]:
              - link "The Weavers" [ref=e188] [cursor=pointer]:
                - /url: /heritage/weavers
            - listitem [ref=e189]:
              - link "Lookbook" [ref=e190] [cursor=pointer]:
                - /url: /lookbook
            - listitem [ref=e191]:
              - link "Sustainability" [ref=e192] [cursor=pointer]:
                - /url: /heritage/sustainability
            - listitem [ref=e193]:
              - link "Blog" [ref=e194] [cursor=pointer]:
                - /url: /journal
        - generic [ref=e195]:
          - heading "Care & Policies" [level=4] [ref=e196]
          - list [ref=e197]:
            - listitem [ref=e198]:
              - link "Care Instructions" [ref=e199] [cursor=pointer]:
                - /url: /care
            - listitem [ref=e200]:
              - link "Shipping Policy" [ref=e201] [cursor=pointer]:
                - /url: /shipping
            - listitem [ref=e202]:
              - link "Returns & Exchange" [ref=e203] [cursor=pointer]:
                - /url: /returns
            - listitem [ref=e204]:
              - link "Privacy Policy" [ref=e205] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e206]:
              - link "Terms of Use" [ref=e207] [cursor=pointer]:
                - /url: /terms
      - separator [ref=e208]
      - generic [ref=e209]:
        - generic [ref=e210]: Free shipping above ₹5,000
        - generic [ref=e211]: ·
        - generic [ref=e212]: Easy 15-day return
        - generic [ref=e213]: ·
        - generic [ref=e214]: Secure payment
        - generic [ref=e215]: ·
        - generic [ref=e216]: UPI · Card · COD
      - paragraph [ref=e218]: © 2026 VC Sarees. All rights reserved.
  - dialog "Shopping cart" [ref=e219]:
    - generic [ref=e220]:
      - heading "Your Bag" [level=2] [ref=e221]
      - generic [ref=e222]: 0 items
      - button "Close cart" [ref=e223] [cursor=pointer]:
        - img [ref=e224]
    - separator [ref=e227]
    - generic [ref=e229]:
      - img [ref=e230]
      - paragraph [ref=e233]: Your bag is empty
      - paragraph [ref=e234]: Discover our handcrafted sarees
      - button "Continue Shopping" [ref=e235] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e241] [cursor=pointer]:
    - img [ref=e242]
  - alert [ref=e245]
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
> 25 |     await page.goto(`/products/${PRODUCT_SLUG}`);
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
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
  51 |     await page.goto(`/products/${PRODUCT_SLUG}`);
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