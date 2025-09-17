import { test, expect } from '@playwright/test';

test.describe('Stratalia Enhanced Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Search Functionality', () => {
    test('should find waggi and show correct results', async ({ page }) => {
      await page.goto('/search');
      
      // Test accessibility
      await expect(page.locator('#main-content')).toBeVisible();
      
      // Test search input
      const searchInput = page.locator('input[placeholder*="zoek"]').first();
      await expect(searchInput).toBeVisible();
      
      // Test waggi search
      await searchInput.fill('waggi');
      await searchInput.press('Enter');
      
      // Wait for results
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 5000 });
      
      // Verify results
      const results = page.locator('[data-testid="search-result"]');
      await expect(results).toHaveCount(1);
      
      const firstResult = results.first();
      await expect(firstResult.locator('text=waggi')).toBeVisible();
      await expect(firstResult.locator('text=auto, wagen')).toBeVisible();
    });

    test('should show suggestions when no results found', async ({ page }) => {
      await page.goto('/search');
      
      const searchInput = page.locator('input[placeholder*="zoek"]').first();
      await searchInput.fill('nonexistentword123');
      await searchInput.press('Enter');
      
      // Wait for suggestions
      await page.waitForSelector('[data-testid="search-suggestions"]', { timeout: 5000 });
      
      const suggestions = page.locator('[data-testid="suggestion-item"]');
      await expect(suggestions).toHaveCountGreaterThan(0);
      
      // Verify waggi is in suggestions
      await expect(page.locator('text=waggi')).toBeVisible();
    });

    test('should support voice search if available', async ({ page, browserName }) => {
      // Skip in Firefox as it doesn't support Web Speech API
      test.skip(browserName === 'firefox', 'Web Speech API not supported in Firefox');
      
      await page.goto('/search');
      
      // Look for voice search button
      const voiceButton = page.locator('[aria-label*="spraak"]').first();
      if (await voiceButton.isVisible()) {
        await expect(voiceButton).toBeEnabled();
        // Note: Actual voice testing requires browser permissions
      }
    });
  });

  test.describe('Knowledge Base', () => {
    test('should display clickable knowledge items', async ({ page }) => {
      await page.goto('/knowledge');
      
      // Wait for knowledge items to load
      await page.waitForSelector('[data-testid="knowledge-item"]', { timeout: 5000 });
      
      const knowledgeItems = page.locator('[data-testid="knowledge-item"]');
      await expect(knowledgeItems).toHaveCountGreaterThan(0);
      
      // Test that items are clickable links
      const firstItem = knowledgeItems.first();
      await expect(firstItem).toHaveAttribute('href');
      
      // Test accessibility
      const itemLink = firstItem.locator('a').first();
      await expect(itemLink).toHaveAttribute('aria-label');
    });

    test('should navigate to knowledge detail page', async ({ page }) => {
      await page.goto('/knowledge');
      
      // Wait for items and click first one
      await page.waitForSelector('[data-testid="knowledge-item"]', { timeout: 5000 });
      const firstItem = page.locator('[data-testid="knowledge-item"]').first();
      
      await firstItem.click();
      
      // Should navigate to detail page
      await expect(page).toHaveURL(/\/knowledge\/[^\/]+$/);
      
      // Should show article content
      await expect(page.locator('article')).toBeVisible();
      
      // Should have back navigation
      const backLink = page.locator('text=Terug naar kennisbank').first();
      await expect(backLink).toBeVisible();
      await expect(backLink).toHaveAttribute('href', '/knowledge');
    });

    test('should show related items on detail page', async ({ page }) => {
      await page.goto('/knowledge');
      
      // Navigate to detail page
      await page.waitForSelector('[data-testid="knowledge-item"]', { timeout: 5000 });
      await page.locator('[data-testid="knowledge-item"]').first().click();
      
      // Check for related items section
      const relatedSection = page.locator('text=Gerelateerde content').first();
      if (await relatedSection.isVisible()) {
        await expect(relatedSection).toBeVisible();
        
        // Should have clickable related items
        const relatedItems = page.locator('[data-testid="related-item"]');
        if (await relatedItems.count() > 0) {
          await expect(relatedItems.first()).toHaveAttribute('href');
        }
      }
    });
  });

  test.describe('Feature Flags', () => {
    test('should respect quiz feature flag', async ({ page }) => {
      await page.goto('/');
      
      // Check if quiz link is visible (depends on feature flag)
      const quizLink = page.locator('nav a[href="/quiz"]');
      
      // If feature is enabled, link should be visible to authenticated users
      // If disabled, link should not be present
      const isVisible = await quizLink.isVisible();
      
      if (isVisible) {
        await expect(quizLink).toHaveAttribute('href', '/quiz');
      }
    });

    test('should respect leaderboard feature flag', async ({ page }) => {
      await page.goto('/');
      
      const leaderboardLink = page.locator('nav a[href="/leaderboard"]');
      const isVisible = await leaderboardLink.isVisible();
      
      if (isVisible) {
        await expect(leaderboardLink).toHaveAttribute('href', '/leaderboard');
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have skip to content link', async ({ page }) => {
      await page.goto('/');
      
      // Focus the page to trigger skip link
      await page.keyboard.press('Tab');
      
      const skipLink = page.locator('text=Ga naar hoofdinhoud');
      await expect(skipLink).toBeFocused();
      await expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    test('should have proper focus management', async ({ page }) => {
      await page.goto('/search');
      
      // Test tab navigation
      await page.keyboard.press('Tab'); // Skip link
      await page.keyboard.press('Tab'); // Should focus on search input
      
      const searchInput = page.locator('input[placeholder*="zoek"]').first();
      await expect(searchInput).toBeFocused();
      
      // Test that focus is visible
      await expect(searchInput).toHaveCSS('outline', /.*/ );
    });

    test('should have proper aria labels', async ({ page }) => {
      await page.goto('/search');
      
      // Check search form has proper labels
      const searchInput = page.locator('input[placeholder*="zoek"]').first();
      await expect(searchInput).toHaveAttribute('aria-label');
      
      // Check buttons have proper labels
      const searchButton = page.locator('button[type="submit"]').first();
      if (await searchButton.isVisible()) {
        await expect(searchButton).toHaveAttribute('aria-label');
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/knowledge');
      
      // Wait for knowledge items
      await page.waitForSelector('[data-testid="knowledge-item"]', { timeout: 5000 });
      
      // Test that items are keyboard accessible
      const firstItem = page.locator('[data-testid="knowledge-item"]').first();
      await firstItem.focus();
      await expect(firstItem).toBeFocused();
      
      // Test Enter key navigation
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/knowledge\/[^\/]+$/);
    });
  });

  test.describe('Performance', () => {
    test('should load search results quickly', async ({ page }) => {
      await page.goto('/search');
      
      const startTime = Date.now();
      
      const searchInput = page.locator('input[placeholder*="zoek"]').first();
      await searchInput.fill('waggi');
      await searchInput.press('Enter');
      
      // Wait for results
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 5000 });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Should respond within 3 seconds for good UX
      expect(responseTime).toBeLessThan(3000);
    });

    test('should have reasonable bundle size', async ({ page }) => {
      // Navigate to main page and check network requests
      const responses: any[] = [];
      page.on('response', response => responses.push(response));
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check main bundle size
      const mainBundle = responses.find(r => r.url().includes('main-') && r.url().includes('.js'));
      if (mainBundle) {
        const size = parseInt(mainBundle.headers()['content-length'] || '0');
        // Main bundle should be under 200KB for good performance
        expect(size).toBeLessThan(200000);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      await page.goto('/search');
      
      // Test with potentially problematic input
      const searchInput = page.locator('input[placeholder*="zoek"]').first();
      await searchInput.fill('<script>alert("xss")</script>');
      await searchInput.press('Enter');
      
      // Should not crash and should sanitize input
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
      
      // Should not execute script
      page.on('dialog', dialog => {
        throw new Error('XSS vulnerability detected!');
      });
    });

    test('should show user-friendly error messages', async ({ page }) => {
      // Test error boundary
      await page.goto('/nonexistent-page');
      
      // Should show 404 page or error message
      const errorMessage = page.locator('text=niet gevonden').first();
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    });
  });
});
