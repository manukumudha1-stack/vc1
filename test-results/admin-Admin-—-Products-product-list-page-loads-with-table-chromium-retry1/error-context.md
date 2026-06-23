# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin — Products >> product list page loads with table
- Location: tests/e2e/admin.spec.ts:62:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/admin/products", waiting until "load"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]: VC
        - generic [ref=e6]: Atelier Admin
      - navigation [ref=e7]:
        - generic [ref=e8]: Menu
        - link "Dashboard" [ref=e9] [cursor=pointer]:
          - /url: /admin
          - img [ref=e10]
          - text: Dashboard
        - link "Products" [ref=e15] [cursor=pointer]:
          - /url: /admin/products
          - img [ref=e16]
          - text: Products
        - link "Collections" [ref=e19] [cursor=pointer]:
          - /url: /admin/collections
          - img [ref=e20]
          - text: Collections
        - link "Inventory" [ref=e25] [cursor=pointer]:
          - /url: /admin/inventory
          - img [ref=e26]
          - text: Inventory
        - link "Orders" [ref=e30] [cursor=pointer]:
          - /url: /admin/orders
          - img [ref=e31]
          - text: Orders
        - link "Customers" [ref=e34] [cursor=pointer]:
          - /url: /admin/customers
          - img [ref=e35]
          - text: Customers
        - link "Discounts" [ref=e38] [cursor=pointer]:
          - /url: /admin/discounts
          - img [ref=e39]
          - text: Discounts
        - link "Reports" [ref=e45] [cursor=pointer]:
          - /url: /admin/reports
          - img [ref=e46]
          - text: Reports
      - generic [ref=e49]:
        - generic [ref=e50]: M
        - generic [ref=e51]:
          - generic [ref=e52]: manukumudha1@gmail.com.com
          - generic [ref=e53]: Admin
    - main [ref=e54]:
      - generic [ref=e55]:
        - generic [ref=e56]:
          - generic [ref=e57]:
            - heading "Products" [level=1] [ref=e58]
            - textbox "Search name or SKU…" [ref=e60]
          - link "+ Add Product" [ref=e61] [cursor=pointer]:
            - /url: /admin/products/new
        - table [ref=e63]:
          - rowgroup [ref=e64]:
            - row "Name SKU Collection Price Stock Status" [ref=e65]:
              - columnheader [ref=e66]
              - columnheader "Name" [ref=e67]
              - columnheader "SKU" [ref=e68]
              - columnheader "Collection" [ref=e69]
              - columnheader "Price" [ref=e70]
              - columnheader "Stock" [ref=e71]
              - columnheader "Status" [ref=e72]
              - columnheader [ref=e73]
          - rowgroup [ref=e74]:
            - row "Temple Border Gadwal Silk Temple Border Gadwal Silk VC-GAD-0102 Gadwal Silk ₹ 42,000 1 low Edit" [ref=e75]:
              - cell "Temple Border Gadwal Silk" [ref=e76]:
                - img "Temple Border Gadwal Silk" [ref=e78]
              - cell "Temple Border Gadwal Silk" [ref=e79]:
                - generic [ref=e80]: Temple Border Gadwal Silk
              - cell "VC-GAD-0102" [ref=e81]
              - cell "Gadwal Silk" [ref=e82]
              - cell "₹ 42,000" [ref=e83]
              - cell "1" [ref=e84]
              - cell "low" [ref=e85]:
                - generic [ref=e86]: low
              - cell "Edit" [ref=e87]:
                - link "Edit" [ref=e89] [cursor=pointer]:
                  - /url: /admin/products/6a38375bbf7cf5bb12590132/edit
            - row "Gadwal Zari Pattu Saree Gadwal Zari Pattu Saree VC-GAD-0101 Gadwal Silk ₹ 34,800 2 low Edit" [ref=e90]:
              - cell "Gadwal Zari Pattu Saree" [ref=e91]:
                - img "Gadwal Zari Pattu Saree" [ref=e93]
              - cell "Gadwal Zari Pattu Saree" [ref=e94]:
                - generic [ref=e95]: Gadwal Zari Pattu Saree
              - cell "VC-GAD-0101" [ref=e96]
              - cell "Gadwal Silk" [ref=e97]
              - cell "₹ 34,800" [ref=e98]
              - cell "2" [ref=e99]
              - cell "low" [ref=e100]:
                - generic [ref=e101]: low
              - cell "Edit" [ref=e102]:
                - link "Edit" [ref=e104] [cursor=pointer]:
                  - /url: /admin/products/6a38375bbf7cf5bb12590131/edit
            - row "Peacock Blue Paithani Silk Peacock Blue Paithani Silk VC-PAI-0103 Paithani Silk ₹ 54,000 2 low Edit" [ref=e105]:
              - cell "Peacock Blue Paithani Silk" [ref=e106]:
                - img "Peacock Blue Paithani Silk" [ref=e108]
              - cell "Peacock Blue Paithani Silk" [ref=e109]:
                - generic [ref=e110]: Peacock Blue Paithani Silk
              - cell "VC-PAI-0103" [ref=e111]
              - cell "Paithani Silk" [ref=e112]
              - cell "₹ 54,000" [ref=e113]
              - cell "2" [ref=e114]
              - cell "low" [ref=e115]:
                - generic [ref=e116]: low
              - cell "Edit" [ref=e117]:
                - link "Edit" [ref=e119] [cursor=pointer]:
                  - /url: /admin/products/6a38375bbf7cf5bb12590130/edit
            - row "Lotus Paithani Wedding Silk Lotus Paithani Wedding Silk VC-PAI-0102 Paithani Silk ₹ 92,000 1 low Edit" [ref=e120]:
              - cell "Lotus Paithani Wedding Silk" [ref=e121]:
                - img "Lotus Paithani Wedding Silk" [ref=e123]
              - cell "Lotus Paithani Wedding Silk" [ref=e124]:
                - generic [ref=e125]: Lotus Paithani Wedding Silk
              - cell "VC-PAI-0102" [ref=e126]
              - cell "Paithani Silk" [ref=e127]
              - cell "₹ 92,000" [ref=e128]
              - cell "1" [ref=e129]
              - cell "low" [ref=e130]:
                - generic [ref=e131]: low
              - cell "Edit" [ref=e132]:
                - link "Edit" [ref=e134] [cursor=pointer]:
                  - /url: /admin/products/6a38375bbf7cf5bb1259012f/edit
            - row "Golden Paithani Peacock Saree Golden Paithani Peacock Saree VC-PAI-0101 Paithani Silk ₹ 68,500 1 low Edit" [ref=e135]:
              - cell "Golden Paithani Peacock Saree" [ref=e136]:
                - img "Golden Paithani Peacock Saree" [ref=e138]
              - cell "Golden Paithani Peacock Saree" [ref=e139]:
                - generic [ref=e140]: Golden Paithani Peacock Saree
              - cell "VC-PAI-0101" [ref=e141]
              - cell "Paithani Silk" [ref=e142]
              - cell "₹ 68,500" [ref=e143]
              - cell "1" [ref=e144]
              - cell "low" [ref=e145]:
                - generic [ref=e146]: low
              - cell "Edit" [ref=e147]:
                - link "Edit" [ref=e149] [cursor=pointer]:
                  - /url: /admin/products/6a38375bbf7cf5bb1259012e/edit
            - row "Ivory Ilkal Festival Silk Ivory Ilkal Festival Silk VC-ILK-0103 Ilkal Silk ₹ 42,000 2 low Edit" [ref=e150]:
              - cell "Ivory Ilkal Festival Silk" [ref=e151]:
                - img "Ivory Ilkal Festival Silk" [ref=e153]
              - cell "Ivory Ilkal Festival Silk" [ref=e154]:
                - generic [ref=e155]: Ivory Ilkal Festival Silk
              - cell "VC-ILK-0103" [ref=e156]
              - cell "Ilkal Silk" [ref=e157]
              - cell "₹ 42,000" [ref=e158]
              - cell "2" [ref=e159]
              - cell "low" [ref=e160]:
                - generic [ref=e161]: low
              - cell "Edit" [ref=e162]:
                - link "Edit" [ref=e164] [cursor=pointer]:
                  - /url: /admin/products/6a38375bbf7cf5bb1259012d/edit
            - row "Crimson Ilkal Bridal Saree Crimson Ilkal Bridal Saree VC-ILK-0102 Ilkal Silk ₹ 56,800 1 low Edit" [ref=e165]:
              - cell "Crimson Ilkal Bridal Saree" [ref=e166]:
                - img "Crimson Ilkal Bridal Saree" [ref=e168]
              - cell "Crimson Ilkal Bridal Saree" [ref=e169]:
                - generic [ref=e170]: Crimson Ilkal Bridal Saree
              - cell "VC-ILK-0102" [ref=e171]
              - cell "Ilkal Silk" [ref=e172]
              - cell "₹ 56,800" [ref=e173]
              - cell "1" [ref=e174]
              - cell "low" [ref=e175]:
                - generic [ref=e176]: low
              - cell "Edit" [ref=e177]:
                - link "Edit" [ref=e179] [cursor=pointer]:
                  - /url: /admin/products/6a38375bbf7cf5bb1259012c/edit
            - row "Ilkal Kasuti Border Silk Ilkal Kasuti Border Silk VC-ILK-0101 Ilkal Silk ₹ 38,500 2 low Edit" [ref=e180]:
              - cell "Ilkal Kasuti Border Silk" [ref=e181]:
                - img "Ilkal Kasuti Border Silk" [ref=e183]
              - cell "Ilkal Kasuti Border Silk" [ref=e184]:
                - generic [ref=e185]: Ilkal Kasuti Border Silk
              - cell "VC-ILK-0101" [ref=e186]
              - cell "Ilkal Silk" [ref=e187]
              - cell "₹ 38,500" [ref=e188]
              - cell "2" [ref=e189]
              - cell "low" [ref=e190]:
                - generic [ref=e191]: low
              - cell "Edit" [ref=e192]:
                - link "Edit" [ref=e194] [cursor=pointer]:
                  - /url: /admin/products/6a38375bbf7cf5bb1259012b/edit
            - row "Pochampally Double Ikat Saree Pochampally Double Ikat Saree VC-POCH-0044 Mix Silk ₹ 31,750 2 low Edit" [ref=e195]:
              - cell "Pochampally Double Ikat Saree" [ref=e196]:
                - img "Pochampally Double Ikat Saree" [ref=e198]
              - cell "Pochampally Double Ikat Saree" [ref=e199]:
                - generic [ref=e200]: Pochampally Double Ikat Saree
              - cell "VC-POCH-0044" [ref=e201]
              - cell "Mix Silk" [ref=e202]
              - cell "₹ 31,750" [ref=e203]
              - cell "2" [ref=e204]
              - cell "low" [ref=e205]:
                - generic [ref=e206]: low
              - cell "Edit" [ref=e207]:
                - link "Edit" [ref=e209] [cursor=pointer]:
                  - /url: /admin/products/6a381a10bf7cf5bb1258fc36/edit
            - row "Kandangi Earth-Check Weave Kandangi Earth-Check Weave VC-CHET-0061 Mix Silk ₹ 14,200 50 instock Edit" [ref=e210]:
              - cell "Kandangi Earth-Check Weave" [ref=e211]:
                - img "Kandangi Earth-Check Weave" [ref=e213]
              - cell "Kandangi Earth-Check Weave" [ref=e214]:
                - generic [ref=e215]: Kandangi Earth-Check Weave
              - cell "VC-CHET-0061" [ref=e216]
              - cell "Mix Silk" [ref=e217]
              - cell "₹ 14,200" [ref=e218]
              - cell "50" [ref=e219]
              - cell "instock" [ref=e220]:
                - generic [ref=e221]: instock
              - cell "Edit" [ref=e222]:
                - link "Edit" [ref=e224] [cursor=pointer]:
                  - /url: /admin/products/6a381a10bf7cf5bb1258fc35/edit
            - row "Champagne Mysore Silk Crepe Champagne Mysore Silk Crepe VC-MYS-0090 Mix Silk ₹ 22,900 3 instock Edit" [ref=e225]:
              - cell "Champagne Mysore Silk Crepe" [ref=e226]:
                - img "Champagne Mysore Silk Crepe" [ref=e228]
              - cell "Champagne Mysore Silk Crepe" [ref=e229]:
                - generic [ref=e230]: Champagne Mysore Silk Crepe
              - cell "VC-MYS-0090" [ref=e231]
              - cell "Mix Silk" [ref=e232]
              - cell "₹ 22,900" [ref=e233]
              - cell "3" [ref=e234]
              - cell "instock" [ref=e235]:
                - generic [ref=e236]: instock
              - cell "Edit" [ref=e237]:
                - link "Edit" [ref=e239] [cursor=pointer]:
                  - /url: /admin/products/6a381a10bf7cf5bb1258fc34/edit
  - button "Open Next.js Dev Tools" [ref=e245] [cursor=pointer]:
    - img [ref=e246]
  - alert [ref=e249]
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | 
  3   | const ADMIN_EMAIL    = process.env.SEED_ADMIN_EMAIL    ?? '';
  4   | const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? '';
  5   | 
  6   | async function loginAsAdmin(page: Page) {
  7   |   await page.goto('/admin/login');
  8   |   await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
  9   |   await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  10  |   await page.getByRole('button', { name: /sign in/i }).click();
  11  |   await expect(page).toHaveURL(/\/admin$/, { timeout: 10000 });
  12  |   // Full page reload so the server-side auth() picks up the session cookie
  13  |   await page.goto('/admin');
  14  |   await page.waitForLoadState('networkidle');
  15  | }
  16  | 
  17  | test.describe('Admin — Login', () => {
  18  |   test('login page renders', async ({ page }) => {
  19  |     await page.goto('/admin/login');
  20  |     await expect(page.locator('text=Atelier Admin').or(page.locator('text=Admin')).first()).toBeVisible();
  21  |     await expect(page.locator('input[type="email"]')).toBeVisible();
  22  |     await expect(page.locator('input[type="password"]')).toBeVisible();
  23  |   });
  24  | 
  25  |   test('wrong credentials shows error', async ({ page }) => {
  26  |     await page.goto('/admin/login');
  27  |     await page.locator('input[type="email"]').fill('wrong@example.com');
  28  |     await page.locator('input[type="password"]').fill('wrongpassword');
  29  |     await page.getByRole('button', { name: /sign in/i }).click();
  30  |     await expect(page.locator('text=Invalid').or(page.locator('text=incorrect').or(page.locator('[class*="error"]'))).first()).toBeVisible({ timeout: 5000 });
  31  |     await expect(page).toHaveURL(/admin\/login/);
  32  |   });
  33  | 
  34  |   test('correct credentials logs in and redirects to dashboard', async ({ page }) => {
  35  |     await loginAsAdmin(page);
  36  |     await expect(page.locator('text=Dashboard').or(page.locator('text=Revenue').or(page.locator('text=Orders'))).first()).toBeVisible({ timeout: 8000 });
  37  |   });
  38  | });
  39  | 
  40  | test.describe('Admin — Dashboard', () => {
  41  |   test.beforeEach(async ({ page }) => {
  42  |     await loginAsAdmin(page);
  43  |   });
  44  | 
  45  |   test('dashboard shows metric cards', async ({ page }) => {
  46  |     const metrics = page.locator('[class*="metric"], [class*="Metric"]');
  47  |     await expect(metrics.first()).toBeVisible({ timeout: 8000 });
  48  |   });
  49  | 
  50  |   test('sidebar navigation links visible', async ({ page }) => {
  51  |     await expect(page.locator('a[href="/admin/products"]').first()).toBeVisible({ timeout: 10000 });
  52  |     await expect(page.locator('a[href="/admin/orders"]').first()).toBeVisible({ timeout: 10000 });
  53  |     await expect(page.locator('a[href="/admin/customers"]').first()).toBeVisible({ timeout: 10000 });
  54  |   });
  55  | });
  56  | 
  57  | test.describe('Admin — Products', () => {
  58  |   test.beforeEach(async ({ page }) => {
  59  |     await loginAsAdmin(page);
  60  |   });
  61  | 
  62  |   test('product list page loads with table', async ({ page }) => {
> 63  |     await page.goto('/admin/products');
      |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  64  |     await expect(page.locator('table, [class*="table"]').first()).toBeVisible({ timeout: 8000 });
  65  |     // Should show seeded products
  66  |     await expect(page.locator('text=Ilkal').first()).toBeVisible({ timeout: 8000 });
  67  |   });
  68  | 
  69  |   test('new product form has all required fields', async ({ page }) => {
  70  |     await page.goto('/admin/products/new');
  71  |     await expect(page.locator('input[placeholder*="Lakshmi"]').first()).toBeVisible({ timeout: 8000 });
  72  |     await expect(page.locator('input[placeholder*="VC-KANJ"]').first()).toBeVisible();
  73  |     await expect(page.locator('input[placeholder*="48500"]').first()).toBeVisible();
  74  |   });
  75  | 
  76  |   test('create new product saves and redirects to product list', async ({ page }) => {
  77  |     await page.goto('/admin/products/new');
  78  |     // Wait for collections to load into the select (fetched via useEffect)
  79  |     await page.waitForFunction(
  80  |       () => (document.querySelector('select') as HTMLSelectElement)?.options.length > 1,
  81  |       { timeout: 10000 }
  82  |     );
  83  | 
  84  |     // Fill all required fields
  85  |     await page.locator('input[placeholder*="Lakshmi"]').fill(`Test Silk Saree ${Date.now()}`);
  86  |     await page.locator('input[placeholder*="VC-KANJ"]').fill(`TEST-SKU-${Date.now()}`);
  87  | 
  88  |     // Collection — pick first real option (index 0 is "Select collection…")
  89  |     await page.locator('select').first().selectOption({ index: 1 });
  90  | 
  91  |     await page.locator('input[placeholder*="48500"]').fill('25000');
  92  |     await page.locator('input[placeholder="e.g. 1"]').fill('5');
  93  |     await page.locator('textarea[placeholder*="Short product"]').fill('A beautiful test silk saree.');
  94  | 
  95  |     // Submit and wait for success message then redirect
  96  |     await page.getByRole('button', { name: /create product|save/i }).click();
  97  |     await expect(page.locator('text=Product saved successfully')).toBeVisible({ timeout: 10000 });
  98  |     await expect(page).toHaveURL(/\/admin\/products$/, { timeout: 15000 });
  99  |   });
  100 | });
  101 | 
  102 | test.describe('Admin — Orders', () => {
  103 |   test.beforeEach(async ({ page }) => {
  104 |     await loginAsAdmin(page);
  105 |   });
  106 | 
  107 |   test('orders list page loads', async ({ page }) => {
  108 |     await page.goto('/admin/orders');
  109 |     await expect(page.locator('table, [class*="table"]').first()).toBeVisible({ timeout: 8000 });
  110 |   });
  111 | 
  112 |   test('order detail page loads', async ({ page }) => {
  113 |     await page.goto('/admin/orders');
  114 |     // Click first order row link
  115 |     const firstOrderLink = page.locator('a[href*="/admin/orders/"]').first();
  116 |     await expect(firstOrderLink).toBeVisible({ timeout: 8000 });
  117 |     await firstOrderLink.click();
  118 |     await expect(page).toHaveURL(/\/admin\/orders\/.+/);
  119 |     await expect(page.locator('text=VC-').first()).toBeVisible({ timeout: 8000 });
  120 |   });
  121 | 
  122 |   test('order status can be updated', async ({ page }) => {
  123 |     await page.goto('/admin/orders');
  124 |     const firstOrderLink = page.locator('a[href*="/admin/orders/"]').first();
  125 |     await firstOrderLink.click();
  126 |     await page.waitForLoadState('networkidle');
  127 | 
  128 |     // Status select — pick a value different from the current one so button is enabled
  129 |     const statusSelect = page.locator('select').first();
  130 |     await expect(statusSelect).toBeVisible({ timeout: 8000 });
  131 |     const current = await statusSelect.inputValue();
  132 |     const next = current === 'confirmed' ? 'shipped' : 'confirmed';
  133 |     await statusSelect.selectOption(next);
  134 | 
  135 |     const updateBtn = page.getByRole('button', { name: /update status/i }).first();
  136 |     await expect(updateBtn).toBeEnabled({ timeout: 3000 });
  137 |     await updateBtn.click();
  138 |     await expect(page.locator(`text=${next}`).first()).toBeVisible({ timeout: 8000 });
  139 |   });
  140 | });
  141 | 
  142 | test.describe('Admin — Inventory & Reports', () => {
  143 |   test.beforeEach(async ({ page }) => {
  144 |     await loginAsAdmin(page);
  145 |   });
  146 | 
  147 |   test('inventory page lists products by stock', async ({ page }) => {
  148 |     await page.goto('/admin/inventory');
  149 |     await expect(page.locator('table, [class*="table"]').first()).toBeVisible({ timeout: 8000 });
  150 |   });
  151 | 
  152 |   test('reports page renders revenue metrics', async ({ page }) => {
  153 |     await page.goto('/admin/reports');
  154 |     await expect(page.locator('text=Revenue').or(page.locator('text=Orders')).first()).toBeVisible({ timeout: 8000 });
  155 |   });
  156 | });
  157 | 
```