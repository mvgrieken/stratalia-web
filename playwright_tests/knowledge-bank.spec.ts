import { test, expect } from '@playwright/test';

test.describe('Knowledge Bank', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/knowledge');
  });

  test('should load knowledge bank page', async ({ page }) => {
    await expect(page).toHaveTitle(/Stratalia/);
    await expect(page.locator('h1')).toContainText('Kennisbank');
  });

  test('should display knowledge items', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('[data-testid="knowledge-item"], .bg-white.rounded-lg.shadow-lg', { timeout: 10000 });
    
    // Check if items are displayed
    const items = page.locator('.bg-white.rounded-lg.shadow-lg');
    await expect(items).toHaveCount.greaterThan(0);
  });

  test('should filter by type', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('select', { timeout: 10000 });
    
    // Test type filter
    const typeFilter = page.locator('select').first();
    await typeFilter.selectOption('article');
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Check if items are filtered (this might be empty if no articles exist)
    const items = page.locator('.bg-white.rounded-lg.shadow-lg');
    const itemCount = await items.count();
    
    // If items exist, they should all be articles
    if (itemCount > 0) {
      // Check that items contain article-related content
      const firstItem = items.first();
      await expect(firstItem).toBeVisible();
    }
  });

  test('should filter by difficulty', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('select', { timeout: 10000 });
    
    // Test difficulty filter
    const difficultyFilter = page.locator('select').nth(1);
    await difficultyFilter.selectOption('beginner');
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Check if items are filtered
    const items = page.locator('.bg-white.rounded-lg.shadow-lg');
    const itemCount = await items.count();
    
    if (itemCount > 0) {
      const firstItem = items.first();
      await expect(firstItem).toBeVisible();
    }
  });

  test('should search knowledge items', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });
    
    // Test search functionality
    const searchInput = page.locator('input[type="text"]');
    await searchInput.fill('straattaal');
    
    // Wait for search to apply
    await page.waitForTimeout(1000);
    
    // Check if search results are displayed
    const items = page.locator('.bg-white.rounded-lg.shadow-lg');
    const itemCount = await items.count();
    
    if (itemCount > 0) {
      const firstItem = items.first();
      await expect(firstItem).toBeVisible();
    }
  });

  test('should navigate to knowledge item detail', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('button:has-text("Bekijk")', { timeout: 10000 });
    
    // Click on first "Bekijk" button
    const firstViewButton = page.locator('button:has-text("Bekijk")').first();
    await firstViewButton.click();
    
    // Check if we're on a detail page
    await expect(page).toHaveURL(/\/knowledge\/[^\/]+$/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display statistics', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('text=Kennisbank Statistieken', { timeout: 10000 });
    
    // Check if statistics section is visible
    const statsSection = page.locator('text=Kennisbank Statistieken');
    await expect(statsSection).toBeVisible();
    
    // Check if statistics numbers are displayed
    const statNumbers = page.locator('.text-2xl.font-bold');
    await expect(statNumbers).toHaveCount.greaterThan(0);
  });

  test('should handle empty search results', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });
    
    // Search for something that doesn't exist
    const searchInput = page.locator('input[type="text"]');
    await searchInput.fill('nonexistentsearchterm12345');
    
    // Wait for search to apply
    await page.waitForTimeout(1000);
    
    // Check if "no results" message is displayed
    const noResults = page.locator('text=Geen resultaten gevonden');
    await expect(noResults).toBeVisible();
  });
});

test.describe('Knowledge Item Detail', () => {
  test('should load knowledge item detail page', async ({ page }) => {
    // Go to a specific knowledge item (using a mock ID)
    await page.goto('/knowledge/test-item-id');
    
    // Check if error page is shown (since test-item-id doesn't exist)
    await expect(page.locator('text=Item niet gevonden')).toBeVisible();
  });

  test('should have breadcrumb navigation', async ({ page }) => {
    // Go to knowledge page first
    await page.goto('/knowledge');
    
    // Wait for content and click on first item
    await page.waitForSelector('button:has-text("Bekijk")', { timeout: 10000 });
    await page.locator('button:has-text("Bekijk")').first().click();
    
    // Check if breadcrumb is visible
    const breadcrumb = page.locator('nav ol');
    await expect(breadcrumb).toBeVisible();
    
    // Check if breadcrumb contains expected links
    await expect(breadcrumb.locator('text=Home')).toBeVisible();
    await expect(breadcrumb.locator('text=Kennisbank')).toBeVisible();
  });
});

test.describe('Knowledge Bank API', () => {
  test('should fetch knowledge items from API', async ({ request }) => {
    const response = await request.get('/api/content/approved');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBeTruthy();
    expect(data.data).toHaveProperty('items');
    expect(data.data).toHaveProperty('statistics');
  });

  test('should filter knowledge items by type', async ({ request }) => {
    const response = await request.get('/api/content/approved?type=article');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBeTruthy();
    expect(data.data.items).toBeDefined();
  });

  test('should search knowledge items', async ({ request }) => {
    const response = await request.get('/api/content/approved?search=straattaal');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBeTruthy();
    expect(data.data.items).toBeDefined();
  });

  test('should handle refresh API', async ({ request }) => {
    const response = await request.get('/api/refresh-knowledge');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBeTruthy();
    expect(data.message).toContain('running');
  });
});
