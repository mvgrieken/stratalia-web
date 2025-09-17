import { test, expect } from '@playwright/test';

test.describe('Knowledge Bank Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to knowledge bank page
    await page.goto('/knowledge');
  });

  test('should display knowledge bank page correctly', async ({ page }) => {
    // Check page title and header
    await expect(page.locator('h1')).toContainText('Kennisbank');
    await expect(page.locator('text=Ontdek artikelen, video\'s, podcasts en meer')).toBeVisible();
  });

  test('should show statistics section', async ({ page }) => {
    // Check statistics cards
    await expect(page.locator('text=Totaal items')).toBeVisible();
    await expect(page.locator('text=Artikelen')).toBeVisible();
    await expect(page.locator('text=Video\'s')).toBeVisible();
    await expect(page.locator('text=Podcasts')).toBeVisible();
  });

  test('should display knowledge items', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('[data-testid="knowledge-item"], .bg-white.rounded-lg', { timeout: 10000 });
    
    // Check that at least one item is displayed
    const items = page.locator('.bg-white.rounded-lg');
    await expect(items).toHaveCount({ min: 1 });
  });

  test('should show item details correctly', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('.bg-white.rounded-lg', { timeout: 10000 });
    
    // Check first item has required elements
    const firstItem = page.locator('.bg-white.rounded-lg').first();
    
    // Check title
    await expect(firstItem.locator('h3')).toBeVisible();
    
    // Check type icon
    await expect(firstItem.locator('text=📄, text=🎥, text=🎧, text=📊, text=📚, text=🎵')).toBeVisible();
    
    // Check difficulty badge
    await expect(firstItem.locator('.px-2.py-1.rounded-full')).toBeVisible();
    
    // Check author
    await expect(firstItem.locator('text=Door')).toBeVisible();
    
    // Check action button
    await expect(firstItem.locator('text=Bekijk')).toBeVisible();
  });

  test('should handle image loading errors gracefully', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('.bg-white.rounded-lg', { timeout: 10000 });
    
    // Check that items with thumbnails show either image or fallback icon
    const itemsWithThumbnails = page.locator('.bg-white.rounded-lg').filter({ has: page.locator('.h-48') });
    
    if (await itemsWithThumbnails.count() > 0) {
      const firstItemWithThumbnail = itemsWithThumbnails.first();
      
      // Should show either image or fallback icon
      const hasImage = await firstItemWithThumbnail.locator('img').count() > 0;
      const hasFallbackIcon = await firstItemWithThumbnail.locator('.text-6xl, .text-4xl').count() > 0;
      
      expect(hasImage || hasFallbackIcon).toBeTruthy();
    }
  });

  test('should filter items by type', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('.bg-white.rounded-lg', { timeout: 10000 });
    
    // Get initial count
    const initialCount = await page.locator('.bg-white.rounded-lg').count();
    
    // Try to filter by type if filter exists
    const typeFilter = page.locator('select, [role="combobox"]').first();
    if (await typeFilter.count() > 0) {
      await typeFilter.selectOption('video');
      
      // Wait for filtering to complete
      await page.waitForTimeout(500);
      
      // Check that items are filtered (count should be different or same if no videos)
      const filteredCount = await page.locator('.bg-white.rounded-lg').count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('should search items', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('.bg-white.rounded-lg', { timeout: 10000 });
    
    // Try to search if search input exists
    const searchInput = page.locator('input[type="search"], input[placeholder*="zoek"], input[placeholder*="search"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('straattaal');
      
      // Wait for search to complete
      await page.waitForTimeout(500);
      
      // Check that search results are shown
      await expect(page.locator('text=van')).toBeVisible();
    }
  });

  test('should navigate to item detail page', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('.bg-white.rounded-lg', { timeout: 10000 });
    
    // Click on first item's "Bekijk" button
    const firstItem = page.locator('.bg-white.rounded-lg').first();
    const viewButton = firstItem.locator('text=Bekijk');
    
    if (await viewButton.count() > 0) {
      await viewButton.click();
      
      // Should navigate to detail page
      await expect(page).toHaveURL(/\/knowledge\/[a-f0-9-]+/);
    }
  });

  test('should show no results message when no items match filters', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('.bg-white.rounded-lg', { timeout: 10000 });
    
    // Try to search for something that doesn't exist
    const searchInput = page.locator('input[type="search"], input[placeholder*="zoek"], input[placeholder*="search"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('nonexistentsearchterm12345');
      
      // Wait for search to complete
      await page.waitForTimeout(500);
      
      // Should show no results message
      await expect(page.locator('text=Geen resultaten, text=No results, text=0 van')).toBeVisible();
    }
  });

  test('should handle empty state gracefully', async ({ page }) => {
    // Mock empty response
    await page.route('/api/knowledge*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], error: null })
      });
    });

    await page.goto('/knowledge');
    
    // Should still show some content (fallback items or empty state)
    await expect(page.locator('h1')).toContainText('Kennisbank');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('/api/knowledge*', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/knowledge');
    
    // Should show fallback content or error state
    await expect(page.locator('h1')).toContainText('Kennisbank');
    
    // Should not crash the page
    await expect(page.locator('body')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for items to load
    await page.waitForSelector('.bg-white.rounded-lg', { timeout: 10000 });
    
    // Check that items are displayed in single column
    const items = page.locator('.bg-white.rounded-lg');
    await expect(items).toHaveCount({ min: 1 });
    
    // Check that content is readable
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should load images without CORS errors', async ({ page }) => {
    // Track console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait for items to load
    await page.waitForSelector('.bg-white.rounded-lg', { timeout: 10000 });
    
    // Wait a bit for images to load
    await page.waitForTimeout(2000);
    
    // Check that there are no CORS or image loading errors
    const imageErrors = errors.filter(error => 
      error.includes('CORS') || 
      error.includes('Failed to load resource') ||
      error.includes('Access to the requested resource is not allowed')
    );
    
    expect(imageErrors).toHaveLength(0);
  });
});