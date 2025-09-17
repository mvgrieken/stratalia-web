import { test, expect } from '@playwright/test';

test.describe('Search Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
  });

  test('should load search page successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Stratalia/);
    
    // Check search input is present
    await expect(page.locator('input[placeholder*="Zoek"]')).toBeVisible();
    
    // Check search button is present
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should search for existing words and show results', async ({ page }) => {
    // Search for "skeer"
    await page.fill('input[placeholder*="Zoek"]', 'skeer');
    await page.click('button[type="submit"]');
    
    // Wait for results to load
    await page.waitForSelector('.bg-white.rounded-lg.shadow-md', { timeout: 10000 });
    
    // Check that results are displayed
    const results = page.locator('.bg-white.rounded-lg.shadow-md');
    await expect(results).toHaveCount(1);
    
    // Check that the result contains the word "skeer"
    await expect(results.first().locator('h3')).toContainText('skeer');
    await expect(results.first().locator('text=arm, weinig geld hebben')).toBeVisible();
  });

  test('should search for "waggi" and show results', async ({ page }) => {
    // Search for "waggi"
    await page.fill('input[placeholder*="Zoek"]', 'waggi');
    await page.click('button[type="submit"]');
    
    // Wait for results to load
    await page.waitForSelector('.bg-white.rounded-lg.shadow-md', { timeout: 10000 });
    
    // Check that results are displayed
    const results = page.locator('.bg-white.rounded-lg.shadow-md');
    await expect(results).toHaveCount(1);
    
    // Check that the result contains the word "waggi"
    await expect(results.first().locator('h3')).toContainText('waggi');
    await expect(results.first().locator('text=auto, wagen')).toBeVisible();
  });

  test('should search for "bro" and show results', async ({ page }) => {
    // Search for "bro"
    await page.fill('input[placeholder*="Zoek"]', 'bro');
    await page.click('button[type="submit"]');
    
    // Wait for results to load
    await page.waitForSelector('.bg-white.rounded-lg.shadow-md', { timeout: 10000 });
    
    // Check that results are displayed
    const results = page.locator('.bg-white.rounded-lg.shadow-md');
    await expect(results).toHaveCount(1);
    
    // Check that the result contains the word "bro"
    await expect(results.first().locator('h3')).toContainText('bro');
    await expect(results.first().locator('text=vriend, maat')).toBeVisible();
  });

  test('should show suggestions when no results found', async ({ page }) => {
    // Search for non-existent word
    await page.fill('input[placeholder*="Zoek"]', 'nonexistentword123');
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(1000);
    
    // Check that suggestions are shown
    await expect(page.locator('text=Probeer deze woorden:')).toBeVisible();
    
    // Check that suggestion buttons are clickable
    const suggestionButtons = page.locator('button').filter({ hasText: /skeer|breezy|flexen|chill|dope|lit/ });
    await expect(suggestionButtons.first()).toBeVisible();
  });

  test('should handle empty search gracefully', async ({ page }) => {
    // Try to search with empty input
    await page.click('button[type="submit"]');
    
    // Should show initial state
    await expect(page.locator('text=Zoek naar straattaal woorden')).toBeVisible();
  });

  test('should show search message with result count', async ({ page }) => {
    // Search for "chill"
    await page.fill('input[placeholder*="Zoek"]', 'chill');
    await page.click('button[type="submit"]');
    
    // Wait for results
    await page.waitForSelector('.bg-white.rounded-lg.shadow-md', { timeout: 10000 });
    
    // Check that search message is displayed
    await expect(page.locator('text=Gevonden 1 resultaat voor "chill"')).toBeVisible();
  });

  test('should show example sentences in results', async ({ page }) => {
    // Search for "dope"
    await page.fill('input[placeholder*="Zoek"]', 'dope');
    await page.click('button[type="submit"]');
    
    // Wait for results
    await page.waitForSelector('.bg-white.rounded-lg.shadow-md', { timeout: 10000 });
    
    // Check that example is shown
    await expect(page.locator('text=Voorbeeld:')).toBeVisible();
    await expect(page.locator('text=Die nieuwe track is echt dope.')).toBeVisible();
  });

  test('should show match type indicators', async ({ page }) => {
    // Search for "skeer" (exact match)
    await page.fill('input[placeholder*="Zoek"]', 'skeer');
    await page.click('button[type="submit"]');
    
    // Wait for results
    await page.waitForSelector('.bg-white.rounded-lg.shadow-md', { timeout: 10000 });
    
    // Check that match type is shown
    await expect(page.locator('text=exact')).toBeVisible();
  });

  test('should handle partial matches', async ({ page }) => {
    // Search for "chil" (partial match for "chill")
    await page.fill('input[placeholder*="Zoek"]', 'chil');
    await page.click('button[type="submit"]');
    
    // Wait for results
    await page.waitForSelector('.bg-white.rounded-lg.shadow-md', { timeout: 10000 });
    
    // Check that partial match is shown
    await expect(page.locator('text=partial')).toBeVisible();
  });

  test('should show relevancy scores', async ({ page }) => {
    // Search for "skeer"
    await page.fill('input[placeholder*="Zoek"]', 'skeer');
    await page.click('button[type="submit"]');
    
    // Wait for results
    await page.waitForSelector('.bg-white.rounded-lg.shadow-md', { timeout: 10000 });
    
    // Check that relevancy score is shown
    await expect(page.locator('text=Relevancy: 100%')).toBeVisible();
  });

  test('should not show error overlay on successful search', async ({ page }) => {
    // Search for "skeer"
    await page.fill('input[placeholder*="Zoek"]', 'skeer');
    await page.click('button[type="submit"]');
    
    // Wait for results
    await page.waitForSelector('.bg-white.rounded-lg.shadow-md', { timeout: 10000 });
    
    // Check that no error overlay is shown
    await expect(page.locator('text=Oeps! Er is iets misgegaan')).not.toBeVisible();
    
    // Check that navigation is still visible
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/words/search*', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    // Search for "skeer"
    await page.fill('input[placeholder*="Zoek"]', 'skeer');
    await page.click('button[type="submit"]');
    
    // Wait for error handling
    await page.waitForTimeout(1000);
    
    // Check that error is handled gracefully
    await expect(page.locator('text=Er is een fout opgetreden bij het zoeken')).toBeVisible();
    
    // Check that navigation is still visible
    await expect(page.locator('nav')).toBeVisible();
  });
});
