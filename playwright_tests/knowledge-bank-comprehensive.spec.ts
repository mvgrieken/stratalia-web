import { test, expect } from '@playwright/test';

test.describe('Knowledge Bank Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/knowledge');
  });

  test('should load knowledge bank page successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Stratalia/);
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('Kennisbank');
    
    // Check statistics are displayed
    await expect(page.locator('text=Totaal items')).toBeVisible();
    await expect(page.locator('text=Artikelen')).toBeVisible();
    await expect(page.locator('text=Video\'s')).toBeVisible();
    await expect(page.locator('text=Podcasts')).toBeVisible();
  });

  test('should display knowledge items', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('[data-testid="knowledge-item"], .bg-white.rounded-lg.shadow-sm', { timeout: 10000 });
    
    // Check that items are displayed
    const items = page.locator('.bg-white.rounded-lg.shadow-sm');
    await expect(items).toHaveCount(6);
    
    // Check that each item has required elements
    for (let i = 0; i < 6; i++) {
      const item = items.nth(i);
      await expect(item.locator('h3')).toBeVisible();
      await expect(item.locator('text=Bekijk')).toBeVisible();
    }
  });

  test('should filter by type correctly', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('.bg-white.rounded-lg.shadow-sm', { timeout: 10000 });
    
    // Test video filter
    await page.selectOption('select', 'video');
    await page.waitForTimeout(500); // Wait for filter to apply
    
    // Should show only video items
    const videoItems = page.locator('.bg-white.rounded-lg.shadow-sm');
    const videoCount = await videoItems.count();
    expect(videoCount).toBeGreaterThan(0);
    
    // Check that all visible items are videos
    for (let i = 0; i < videoCount; i++) {
      const item = videoItems.nth(i);
      await expect(item.locator('text=🎥')).toBeVisible();
    }
    
    // Test podcast filter
    await page.selectOption('select', 'podcast');
    await page.waitForTimeout(500);
    
    const podcastItems = page.locator('.bg-white.rounded-lg.shadow-sm');
    const podcastCount = await podcastItems.count();
    expect(podcastCount).toBeGreaterThan(0);
    
    // Check that all visible items are podcasts
    for (let i = 0; i < podcastCount; i++) {
      const item = podcastItems.nth(i);
      await expect(item.locator('text=🎧')).toBeVisible();
    }
    
    // Test article filter
    await page.selectOption('select', 'article');
    await page.waitForTimeout(500);
    
    const articleItems = page.locator('.bg-white.rounded-lg.shadow-sm');
    const articleCount = await articleItems.count();
    expect(articleCount).toBeGreaterThan(0);
    
    // Check that all visible items are articles
    for (let i = 0; i < articleCount; i++) {
      const item = articleItems.nth(i);
      await expect(item.locator('text=📄')).toBeVisible();
    }
  });

  test('should search functionality work', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('.bg-white.rounded-lg.shadow-sm', { timeout: 10000 });
    
    // Search for "social"
    await page.fill('input[placeholder*="Zoek"]', 'social');
    await page.waitForTimeout(500); // Wait for debounced search
    
    // Should show filtered results
    const items = page.locator('.bg-white.rounded-lg.shadow-sm');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
    
    // Check that results contain "social" in title or content
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const text = await item.textContent();
      expect(text?.toLowerCase()).toContain('social');
    }
  });

  test('should navigate to detail page', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('.bg-white.rounded-lg.shadow-sm', { timeout: 10000 });
    
    // Click on first item
    const firstItem = page.locator('.bg-white.rounded-lg.shadow-sm').first();
    const title = await firstItem.locator('h3').textContent();
    
    await firstItem.locator('text=Bekijk').click();
    
    // Should navigate to detail page
    await expect(page).toHaveURL(/\/knowledge\/[a-f0-9-]+/);
    
    // Check that detail page shows the same title
    await expect(page.locator('h1')).toContainText(title || '');
  });

  test('should display video player for video items', async ({ page }) => {
    // Navigate to video item
    await page.goto('/knowledge/1614551a-e197-42ff-ac1d-b7573f5cfd7f');
    
    // Check that video player is displayed
    await expect(page.locator('video')).toBeVisible();
    
    // Check that video has controls
    await expect(page.locator('video[controls]')).toBeVisible();
  });

  test('should display audio player for podcast items', async ({ page }) => {
    // Navigate to podcast item
    await page.goto('/knowledge/6dd5b2b4-2c9c-48dc-b632-01d70de074a2');
    
    // Check that audio player is displayed
    await expect(page.locator('audio')).toBeVisible();
    
    // Check that audio has controls
    await expect(page.locator('audio[controls]')).toBeVisible();
  });

  test('should clear filters work', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('.bg-white.rounded-lg.shadow-sm', { timeout: 10000 });
    
    // Apply some filters
    await page.selectOption('select', 'video');
    await page.fill('input[placeholder*="Zoek"]', 'test');
    await page.waitForTimeout(500);
    
    // Clear filters
    await page.click('text=Filters wissen');
    
    // Should show all items again
    const items = page.locator('.bg-white.rounded-lg.shadow-sm');
    await expect(items).toHaveCount(6);
    
    // Check that search input is cleared
    await expect(page.locator('input[placeholder*="Zoek"]')).toHaveValue('');
    
    // Check that type filter is reset
    await expect(page.locator('select')).toHaveValue('all');
  });

  test('should show no results message when no matches', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('.bg-white.rounded-lg.shadow-sm', { timeout: 10000 });
    
    // Search for something that doesn't exist
    await page.fill('input[placeholder*="Zoek"]', 'nonexistentword123');
    await page.waitForTimeout(500);
    
    // Should show no results message
    await expect(page.locator('text=Geen resultaten gevonden')).toBeVisible();
    await expect(page.locator('text=Alle filters wissen')).toBeVisible();
  });

  test('should handle difficulty filter', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('.bg-white.rounded-lg.shadow-sm', { timeout: 10000 });
    
    // Filter by beginner difficulty
    await page.selectOption('select:nth-of-type(2)', 'beginner');
    await page.waitForTimeout(500);
    
    // Should show only beginner items
    const items = page.locator('.bg-white.rounded-lg.shadow-sm');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
    
    // Check that all visible items are beginner level
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      await expect(item.locator('text=beginner')).toBeVisible();
    }
  });

  test('should display correct statistics', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('.bg-white.rounded-lg.shadow-sm', { timeout: 10000 });
    
    // Check total count
    await expect(page.locator('text=6')).toBeVisible(); // Should show 6 total items
    
    // Check individual type counts
    await expect(page.locator('text=4')).toBeVisible(); // Should show 4 articles
    await expect(page.locator('text=1')).toBeVisible(); // Should show 1 video and 1 podcast
  });
});
