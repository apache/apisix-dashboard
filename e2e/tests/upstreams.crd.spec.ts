import { expect } from "@playwright/test";
import { randomId } from "@utils/common";
import { test } from "@utils/test";
import { uiGoto } from "@utils/ui";
import { UpstreamsPOM } from "e2e/pom/upstreams";


const upstreamName = randomId("upstream");
test('should create new upstream and verify it appears in list', { tag: '@upstreams' }, async ({ page }) => {
  const upstreamsPom = new UpstreamsPOM(page);
  await upstreamsPom.goto();

  await test.step('create new upstream with basic information', async () => {
    await upstreamsPom.addUpstreamBtn.click();
    
    // Fill basic information
    await page.getByLabel('Name').fill(upstreamName);
    await page.getByLabel('Description').fill('Test upstream created by e2e test');
    
    // Add a node
    await page.getByRole('button', { name: 'Add a Node' }).click();
    await page.getByPlaceholder('Please enter the host').fill('127.0.0.1');
    await page.getByPlaceholder('Please enter the port').fill('8080');
    await page.getByPlaceholder('Please enter the weight').fill('1');
    
    // Set scheme
    await page.locator('input[role="combobox"]').nth(0).click();
    await page.getByTitle('http').click();
    
    // Submit form
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page).toHaveURL(/upstreams$/);
  });

  await test.step('verify new upstream appears in list', async () => {
    await expect(page.getByRole('cell', { name: upstreamName })).toBeVisible();
  });
});

test('should delete an upstream', { tag: '@upstreams' }, async ({ page }) => {
  await uiGoto(page, '/upstreams');
  
  const upstreamName = `test-upstream-to-delete-${Date.now()}`;
  
  await test.step('create upstream to be deleted', async () => {
    await page.getByRole('button', { name: 'Add Upstream' }).click();
    
    // Fill basic information
    await page.getByLabel('Name').fill(upstreamName);
    
    // Add a node
    await page.getByRole('button', { name: 'Add a Node' }).click();
    await page.getByPlaceholder('Please enter the host').fill('127.0.0.1');
    await page.getByPlaceholder('Please enter the port').fill('8080');
    await page.getByPlaceholder('Please enter the weight').fill('1');
    
    // Submit form
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page).toHaveURL(/upstreams$/);
    
    // Verify created upstream
    await expect(page.getByRole('cell', { name: upstreamName })).toBeVisible();
  });

  await test.step('delete upstream and verify it is removed', async () => {
    // Find and click delete button for the upstream
    const row = page.getByRole('row', { name: new RegExp(upstreamName) });
    await row.getByRole('button', { name: 'Delete' }).click();
    
    // Confirm deletion
    await page.getByRole('button', { name: 'Confirm' }).click();
    
    // Verify upstream is no longer in list
    await expect(page.getByRole('cell', { name: upstreamName })).not.toBeVisible({ timeout: 5000 });
  });
});

test('should verify pagination features on upstreams page', { tag: '@upstreams' }, async ({ page }) => {
  await uiGoto(page, '/upstreams');
  
  await test.step('verify pagination works', async () => {
    // Check pagination elements
    await expect(page.getByText(/[0-9]+-[0-9]+ of [0-9]+ items/)).toBeVisible();
    
    // Verify page size options
    const pageSizeSelector = page.locator('div').filter({ hasText: /10 \/ page/ });
    await expect(pageSizeSelector).toBeVisible();
  });
});

test('should view upstream details', { tag: '@upstreams' }, async ({ page }) => {
  // Create a test upstream to ensure we have one to view
  await uiGoto(page, '/upstreams');
  const upstreamName = `test-view-upstream-${Date.now()}`;
  
  await test.step('create test upstream', async () => {
    await page.getByRole('button', { name: 'Add Upstream' }).click();
    await page.getByLabel('Name').fill(upstreamName);
    await page.getByRole('button', { name: 'Add a Node' }).click();
    await page.getByPlaceholder('Please enter the host').fill('127.0.0.1');
    await page.getByPlaceholder('Please enter the port').fill('8080');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page).toHaveURL(/upstreams$/);
    await expect(page.getByRole('cell', { name: upstreamName })).toBeVisible();
  });
  
  await test.step('view upstream details', async () => {
    // Find our created upstream row
    const upstreamRow = page.getByRole('row', { name: new RegExp(upstreamName) });
    await upstreamRow.getByRole('button', { name: 'View' }).click();
    
    // Verify we're on the details page
    await expect(page).toHaveURL(/upstreams\/[^/]+$/);
    await expect(page.getByRole('heading')).toContainText(upstreamName);
  });
});
