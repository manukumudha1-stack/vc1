# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: storefront.spec.ts >> Storefront — Page Renders >> PDP pincode check — unserviceable pincode
- Location: tests/e2e/storefront.spec.ts:51:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/products/ilkal-kasuti-border-silk", waiting until "load"

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
        - link "Ilkal Silk" [ref=e37] [cursor=pointer]:
          - /url: /collections/ilkal-silk
        - generic [ref=e38]: ›
        - generic [ref=e39]: Ilkal Kasuti Border Silk
      - generic [ref=e40]:
        - generic [ref=e42]:
          - generic [ref=e43]:
            - button "Full saree drape — tope teni pallu" [ref=e44] [cursor=pointer]:
              - img "Full saree drape — tope teni pallu" [ref=e46]
            - button "Kasuti hand-embroidered border detail" [ref=e47] [cursor=pointer]:
              - img "Kasuti hand-embroidered border detail" [ref=e49]
            - button "Silver zari pallu close-up" [ref=e50] [cursor=pointer]:
              - img "Silver zari pallu close-up" [ref=e52]
            - button "Body weave texture" [ref=e53] [cursor=pointer]:
              - img "Body weave texture" [ref=e55]
          - generic [ref=e56]:
            - generic [ref=e57]:
              - img "Full saree drape — tope teni pallu" [ref=e58]
              - generic [ref=e59]: Full saree drape — tope teni pallu
            - button "Previous image" [ref=e60] [cursor=pointer]:
              - img [ref=e61]
            - button "Next image" [ref=e63] [cursor=pointer]:
              - img [ref=e64]
        - generic [ref=e66]:
          - generic [ref=e67]: Ilkal, Bagalkot District, Karnataka
          - heading "Ilkal Kasuti Border Silk" [level=1] [ref=e68]
          - generic [ref=e69]:
            - generic [ref=e70]: Pure Mulberry Silk
            - generic [ref=e71]: Silver Zari
            - generic [ref=e72]: Wedding
            - generic [ref=e73]: Festival
          - paragraph [ref=e74]: ₹ 38,500
          - paragraph [ref=e75]: Only 2 left
          - paragraph [ref=e76]: A treasured example of Ilkal's GI-tagged craft — a cream silk body grounded by the iconic tope teni (joined pallu) technique. The six-inch silver zari pallu is framed by a kasuti hand-embroidered border running the full length of the saree, featuring the traditional menthi flower and negi running-stitch motifs in deep crimson thread.
          - generic [ref=e77]:
            - button "Add to Bag" [ref=e78] [cursor=pointer]
            - button "Add to wishlist" [ref=e79] [cursor=pointer]:
              - img [ref=e80]
          - table [ref=e82]:
            - rowgroup [ref=e83]:
              - row "Fabric Pure Mulberry Silk" [ref=e84]:
                - cell "Fabric" [ref=e85]
                - cell "Pure Mulberry Silk" [ref=e86]
              - row "Zari Silver Zari" [ref=e87]:
                - cell "Zari" [ref=e88]
                - cell "Silver Zari" [ref=e89]
              - row "Blouse Piece Included" [ref=e90]:
                - cell "Blouse Piece" [ref=e91]
                - cell "Included" [ref=e92]
              - row "Weaver Ilkal Weavers Cooperative Society" [ref=e93]:
                - cell "Weaver" [ref=e94]
                - cell "Ilkal Weavers Cooperative Society" [ref=e95]
          - generic [ref=e96]:
            - paragraph [ref=e97]: Check delivery availability
            - generic [ref=e98]:
              - textbox "Delivery pincode" [ref=e99]:
                - /placeholder: Enter 6-digit pincode
              - button "Check" [disabled] [ref=e100]
          - generic [ref=e101]:
            - button "Care Instructions" [ref=e103] [cursor=pointer]:
              - generic [ref=e104]: Care Instructions
              - img [ref=e105]
            - button "Fabric & Weave" [ref=e108] [cursor=pointer]:
              - generic [ref=e109]: Fabric & Weave
              - img [ref=e110]
            - button "Shipping & Returns" [ref=e113] [cursor=pointer]:
              - generic [ref=e114]: Shipping & Returns
              - img [ref=e115]
      - generic [ref=e117]:
        - generic [ref=e118]:
          - paragraph [ref=e119]: The story behind
          - heading "Maker's Note" [level=2] [ref=e120]
          - paragraph [ref=e121]: Ilkal sarees have been woven in the Bagalkot district of northern Karnataka for over five centuries. The tope teni technique — where the pallu is woven separately on a different loom and then joined to the body using an interlocking thread — is unique to Ilkal and cannot be replicated on a power loom. The kasuti embroidery on the border is worked entirely by hand, stitch by stitch, by women artisans in weavers' households. This particular weave took two weavers eleven days to complete.
        - generic [ref=e123]: Ilkal Kasuti Border Silk — Detail
      - generic [ref=e124]:
        - generic [ref=e125]:
          - paragraph [ref=e126]: From the same collection
          - heading "You may also love" [level=2] [ref=e127]
        - generic [ref=e128]:
          - article [ref=e129]:
            - link [ref=e130] [cursor=pointer]:
              - /url: /products/crimson-ilkal-bridal-saree
              - generic [ref=e132]: Crimson Ilkal Bridal Saree
            - button "Add to wishlist" [ref=e134] [cursor=pointer]:
              - img [ref=e135]
            - generic [ref=e137]:
              - generic [ref=e138]: Only 1 left
              - link "Crimson Ilkal Bridal Saree" [ref=e139] [cursor=pointer]:
                - /url: /products/crimson-ilkal-bridal-saree
                - heading "Crimson Ilkal Bridal Saree" [level=3] [ref=e140]
              - paragraph [ref=e141]: Ilkal, Bagalkot District, Karnataka
              - generic [ref=e142]:
                - generic [ref=e143]: ₹ 56,800
                - generic [ref=e144]: Pure Mulberry Silk
          - article [ref=e145]:
            - link [ref=e146] [cursor=pointer]:
              - /url: /products/ivory-ilkal-festival-silk
              - generic [ref=e148]: Ivory Ilkal Festival Silk
            - button "Add to wishlist" [ref=e150] [cursor=pointer]:
              - img [ref=e151]
            - generic [ref=e153]:
              - generic [ref=e154]: Only 2 left
              - link "Ivory Ilkal Festival Silk" [ref=e155] [cursor=pointer]:
                - /url: /products/ivory-ilkal-festival-silk
                - heading "Ivory Ilkal Festival Silk" [level=3] [ref=e156]
              - paragraph [ref=e157]: Ilkal, Bagalkot District, Karnataka
              - generic [ref=e158]:
                - generic [ref=e159]: ₹ 42,000
                - generic [ref=e160]: Pure Mulberry Silk
          - article [ref=e161]:
            - link [ref=e162] [cursor=pointer]:
              - /url: /products/test-silk-saree-1782073305303
              - generic [ref=e164]: Test Silk Saree 1782073305303
            - button "Add to wishlist" [ref=e166] [cursor=pointer]:
              - img [ref=e167]
            - generic [ref=e169]:
              - link "Test Silk Saree 1782073305303" [ref=e170] [cursor=pointer]:
                - /url: /products/test-silk-saree-1782073305303
                - heading "Test Silk Saree 1782073305303" [level=3] [ref=e171]
              - generic [ref=e173]: ₹ 25,000
  - contentinfo [ref=e174]:
    - generic [ref=e175]:
      - generic [ref=e176]:
        - generic [ref=e177]:
          - generic [ref=e178]: VC
          - paragraph [ref=e179]:
            - text: Woven in gold.
            - text: Worn through generations.
          - link "WhatsApp us" [ref=e180] [cursor=pointer]:
            - /url: https://wa.me/919999999999
            - img [ref=e181]
            - text: WhatsApp us
        - generic [ref=e183]:
          - heading "Shop" [level=4] [ref=e184]
          - list [ref=e185]:
            - listitem [ref=e186]:
              - link "Ilkal Silk" [ref=e187] [cursor=pointer]:
                - /url: /collections/ilkal-silk
            - listitem [ref=e188]:
              - link "Paithani Silk" [ref=e189] [cursor=pointer]:
                - /url: /collections/paithani-silk
            - listitem [ref=e190]:
              - link "Gadwal Silk" [ref=e191] [cursor=pointer]:
                - /url: /collections/gadwal-silk
            - listitem [ref=e192]:
              - link "Mix Silk" [ref=e193] [cursor=pointer]:
                - /url: /collections/mix-silk
            - listitem [ref=e194]:
              - link "All Collections" [ref=e195] [cursor=pointer]:
                - /url: /collections
        - generic [ref=e196]:
          - heading "The House" [level=4] [ref=e197]
          - list [ref=e198]:
            - listitem [ref=e199]:
              - link "Our Story" [ref=e200] [cursor=pointer]:
                - /url: /heritage
            - listitem [ref=e201]:
              - link "The Weavers" [ref=e202] [cursor=pointer]:
                - /url: /heritage/weavers
            - listitem [ref=e203]:
              - link "Lookbook" [ref=e204] [cursor=pointer]:
                - /url: /lookbook
            - listitem [ref=e205]:
              - link "Sustainability" [ref=e206] [cursor=pointer]:
                - /url: /heritage/sustainability
            - listitem [ref=e207]:
              - link "Blog" [ref=e208] [cursor=pointer]:
                - /url: /journal
        - generic [ref=e209]:
          - heading "Care & Policies" [level=4] [ref=e210]
          - list [ref=e211]:
            - listitem [ref=e212]:
              - link "Care Instructions" [ref=e213] [cursor=pointer]:
                - /url: /care
            - listitem [ref=e214]:
              - link "Shipping Policy" [ref=e215] [cursor=pointer]:
                - /url: /shipping
            - listitem [ref=e216]:
              - link "Returns & Exchange" [ref=e217] [cursor=pointer]:
                - /url: /returns
            - listitem [ref=e218]:
              - link "Privacy Policy" [ref=e219] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e220]:
              - link "Terms of Use" [ref=e221] [cursor=pointer]:
                - /url: /terms
      - separator [ref=e222]
      - generic [ref=e223]:
        - generic [ref=e224]: Free shipping above ₹5,000
        - generic [ref=e225]: ·
        - generic [ref=e226]: Easy 15-day return
        - generic [ref=e227]: ·
        - generic [ref=e228]: Secure payment
        - generic [ref=e229]: ·
        - generic [ref=e230]: UPI · Card · COD
      - paragraph [ref=e232]: © 2026 VC Sarees. All rights reserved.
  - dialog "Shopping cart" [ref=e233]:
    - generic [ref=e234]:
      - heading "Your Bag" [level=2] [ref=e235]
      - generic [ref=e236]: 0 items
      - button "Close cart" [ref=e237] [cursor=pointer]:
        - img [ref=e238]
    - separator [ref=e241]
    - generic [ref=e243]:
      - img [ref=e244]
      - paragraph [ref=e247]: Your bag is empty
      - paragraph [ref=e248]: Discover our handcrafted sarees
      - button "Continue Shopping" [ref=e249] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e255] [cursor=pointer]:
    - img [ref=e256]
  - alert [ref=e259]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const COLLECTION_SLUG = 'ilkal-silk';
  4  | const PRODUCT_SLUG    = 'ilkal-kasuti-border-silk';
  5  | 
  6  | test.describe('Storefront — Page Renders', () => {
  7  |   test('home page loads with hero and collections', async ({ page }) => {
  8  |     await page.goto('/');
  9  |     await expect(page).toHaveTitle(/VC/);
  10 |     // Hero section present
  11 |     await expect(page.locator('text=Woven in gold').or(page.locator('text=Bridal')).first()).toBeVisible({ timeout: 10000 });
  12 |     // Nav logo
  13 |     await expect(page.locator('text=VC').first()).toBeVisible();
  14 |   });
  15 | 
  16 |   test('collection page loads product grid', async ({ page }) => {
  17 |     await page.goto(`/collections/${COLLECTION_SLUG}`);
  18 |     // At least one product card rendered
  19 |     const cards = page.locator('a[href^="/products/"]');
  20 |     await expect(cards.first()).toBeVisible({ timeout: 10000 });
  21 |     const count = await cards.count();
  22 |     expect(count).toBeGreaterThan(0);
  23 |   });
  24 | 
  25 |   test('sort select updates URL', async ({ page }) => {
  26 |     await page.goto(`/collections/${COLLECTION_SLUG}`);
  27 |     await page.waitForLoadState('networkidle');
  28 |     const select = page.locator('select').first();
  29 |     await select.selectOption('price-asc');
  30 |     await expect(page).toHaveURL(/sort=price-asc/);
  31 |   });
  32 | 
  33 |   test('PDP loads with product name and price', async ({ page }) => {
  34 |     await page.goto(`/products/${PRODUCT_SLUG}`);
  35 |     await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  36 |     // Price element visible
  37 |     await expect(page.locator('.price').first()).toBeVisible();
  38 |     // "Add to Bag" button present
  39 |     await expect(page.getByRole('button', { name: 'Add to Bag' })).toBeVisible();
  40 |   });
  41 | 
  42 |   test('PDP pincode check — valid seeded pincode', async ({ page }) => {
  43 |     await page.goto(`/products/${PRODUCT_SLUG}`);
  44 |     const input = page.locator('input[inputmode="numeric"], input[placeholder*="pincode"], input[maxlength="6"]').first();
  45 |     await expect(input).toBeVisible({ timeout: 10000 });
  46 |     await input.fill('560011');
  47 |     await page.getByRole('button', { name: /check/i }).click();
  48 |     await expect(page.locator('text=deliverable').or(page.locator('text=days')).first()).toBeVisible({ timeout: 8000 });
  49 |   });
  50 | 
  51 |   test('PDP pincode check — unserviceable pincode', async ({ page }) => {
> 52 |     await page.goto(`/products/${PRODUCT_SLUG}`);
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  53 |     const input = page.locator('input[inputmode="numeric"], input[placeholder*="pincode"], input[maxlength="6"]').first();
  54 |     await expect(input).toBeVisible({ timeout: 10000 });
  55 |     await input.fill('999999');
  56 |     await page.getByRole('button', { name: /check/i }).click();
  57 |     await expect(page.locator('text=not').or(page.locator('text=Sorry')).first()).toBeVisible({ timeout: 8000 });
  58 |   });
  59 | 
  60 |   test('404 — nonexistent collection returns 404 page', async ({ page }) => {
  61 |     const response = await page.goto('/collections/nonexistent-xyz');
  62 |     expect(response?.status()).toBe(404);
  63 |   });
  64 | 
  65 |   test('404 — nonexistent product returns 404 page', async ({ page }) => {
  66 |     const response = await page.goto('/products/nonexistent-xyz');
  67 |     expect(response?.status()).toBe(404);
  68 |   });
  69 | });
  70 | 
```