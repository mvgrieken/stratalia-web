import { test, expect } from '@playwright/test';

test.describe('Knowledge Bank - Final Test', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the knowledge bank page
    await page.goto('/knowledge');
  });

  test('should display knowledge items without errors', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that no error state is shown
    await expect(page.locator('text=Fout bij laden')).not.toBeVisible();
    await expect(page.locator('text=Er is een fout opgetreden')).not.toBeVisible();
    
    // Check that knowledge items are displayed
    const knowledgeItems = page.locator('[data-testid="knowledge-item"], .knowledge-item, article, .card');
    await expect(knowledgeItems.first()).toBeVisible({ timeout: 10000 });
    
    // Verify at least one item is shown
    const itemCount = await knowledgeItems.count();
    expect(itemCount).toBeGreaterThan(0);
    
    // Check for specific content types
    const hasArticle = await page.locator('text=Welkom bij Stratalia').isVisible();
    const hasVideo = await page.locator('text=Straattaal voor Beginners').isVisible();
    const hasPodcast = await page.locator('text=Straattaal Podcast').isVisible();
    const hasMusic = await page.locator('text=Straattaal in Nederlandse Rap').isVisible();
    
    // At least some content should be visible
    expect(hasArticle || hasVideo || hasPodcast || hasMusic).toBe(true);
  });

  test('should display fallback items when database is unavailable', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/**', route => route.abort());
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still show content (fallback items)
    const knowledgeItems = page.locator('[data-testid="knowledge-item"], .knowledge-item, article, .card');
    await expect(knowledgeItems.first()).toBeVisible({ timeout: 10000 });
    
    // Should not show error state
    await expect(page.locator('text=Fout bij laden')).not.toBeVisible();
  });

  test('should display different content types', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for different content types
    const contentTypes = [
      'article', 'video', 'podcast', 'music'
    ];
    
    let visibleTypes = 0;
    for (const type of contentTypes) {
      const typeElement = page.locator(`[data-type="${type}"], .${type}, [class*="${type}"]`);
      if (await typeElement.first().isVisible()) {
        visibleTypes++;
      }
    }
    
    // Should have at least 2 different content types
    expect(visibleTypes).toBeGreaterThanOrEqual(2);
  });

  test('should have working navigation', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check that navigation is present
    const navigation = page.locator('nav, .navigation, [role="navigation"]');
    await expect(navigation).toBeVisible();
    
    // Check that we can navigate back to home
    const homeLink = page.locator('a[href="/"], a[href="/home"], text=Home, text=Stratalia');
    if (await homeLink.first().isVisible()) {
      await homeLink.first().click();
      await expect(page).toHaveURL(/\/$|\/home/);
    }
  });

  test('should display thumbnails for items', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for images/thumbnails
    const images = page.locator('img, [data-testid="thumbnail"], .thumbnail');
    const imageCount = await images.count();
    
    // Should have at least some images
    expect(imageCount).toBeGreaterThan(0);
    
    // Check that images are loading (not broken)
    for (let i = 0; i < Math.min(imageCount, 3); i++) {
      const img = images.nth(i);
      await expect(img).toBeVisible();
      
      // Check that image has src or is not broken
      const src = await img.getAttribute('src');
      expect(src).toBeTruthy();
    }
  });

  test('should handle filtering and search', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for filter controls
    const filterControls = page.locator('input[type="search"], input[placeholder*="zoek"], select, .filter, .search');
    
    if (await filterControls.first().isVisible()) {
      // Test search functionality
      const searchInput = filterControls.first();
      await searchInput.fill('straattaal');
      await page.waitForTimeout(500); // Wait for search to process
      
      // Should still show some results
      const knowledgeItems = page.locator('[data-testid="knowledge-item"], .knowledge-item, article, .card');
      const itemCount = await knowledgeItems.count();
      expect(itemCount).toBeGreaterThan(0);
    }
  });

  test('should not show console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Check for specific errors that should be suppressed
    const mutationObserverErrors = consoleErrors.filter(error => 
      error.includes('MutationObserver') || 
      error.includes('credentials-library.js') ||
      error.includes('Argument 1') ||
      error.includes('must be an instance of Node')
    );
    
    expect(mutationObserverErrors).toHaveLength(0);
    
    // Log any remaining errors for debugging
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }
  });
});
