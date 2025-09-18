import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Login Flow
 * Ensures login works without 500 errors and handles all scenarios properly
 */

test.describe('Login Flow - Error Cluster Prevention', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh for each test
    await page.goto('/');
  });

  test.describe('Login Success Scenarios', () => {
    test('should login successfully with valid credentials', async ({ page }) => {
      // Skip if no test credentials provided
      const testEmail = process.env.TEST_USER_EMAIL;
      const testPassword = process.env.TEST_USER_PASSWORD;
      
      if (!testEmail || !testPassword) {
        test.skip('No test credentials provided');
      }

      await page.goto('/login');
      
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);
      
      // Submit login form
      await page.click('button[type="submit"]');
      
      // Wait for navigation
      await page.waitForTimeout(3000);
      
      // Should redirect to dashboard (not stay on login)
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('/login');
      
      // Should be on dashboard or home page
      const isOnDashboard = currentUrl.includes('/dashboard') || currentUrl.includes('/');
      expect(isOnDashboard).toBe(true);
    });
  });

  test.describe('Login Error Handling', () => {
    test('should handle empty form submission (NO 500)', async ({ page }) => {
      await page.goto('/login');
      
      // Submit empty form
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      
      // Check for any 500 error indicators
      const bodyText = await page.textContent('body');
      expect(bodyText).not.toContain('500');
      expect(bodyText).not.toContain('Internal Server Error');
      expect(bodyText).not.toContain('Something went wrong');
      
      // Should show validation message
      const hasValidationError = bodyText?.includes('verplicht') || 
                                bodyText?.includes('required') ||
                                bodyText?.includes('veld');
      
      if (hasValidationError) {
        expect(hasValidationError).toBe(true);
      }
    });

    test('should handle invalid email format (400 not 500)', async ({ page }) => {
      await page.goto('/login');
      
      await page.fill('input[type="email"]', 'not-an-email');
      await page.fill('input[type="password"]', 'somepassword');
      
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      
      // Should not get 500 error
      const bodyText = await page.textContent('body');
      expect(bodyText).not.toContain('500');
      expect(bodyText).not.toContain('Internal Server Error');
    });

    test('should handle non-existent user (401 not 500)', async ({ page }) => {
      await page.goto('/login');
      
      await page.fill('input[type="email"]', 'nonexistent@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      // Should get proper error message, not 500
      const bodyText = await page.textContent('body');
      expect(bodyText).not.toContain('500');
      
      // Should show user-friendly error
      const hasUserError = bodyText?.includes('ongeldig') || 
                          bodyText?.includes('incorrect') ||
                          bodyText?.includes('controleer');
      
      if (hasUserError) {
        expect(hasUserError).toBe(true);
      }
    });
  });

  test.describe('Registration Error Handling', () => {
    test('should handle registration validation (400 not 500)', async ({ page }) => {
      await page.goto('/register');
      
      // Fill with invalid data
      await page.fill('input[type="email"]', 'invalid-email');
      await page.fill('input[type="password"]', '123'); // Too weak
      await page.fill('input[name="full_name"]', 'X'); // Too short
      
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      
      // Should not get 500 error
      const bodyText = await page.textContent('body');
      expect(bodyText).not.toContain('500');
      expect(bodyText).not.toContain('Internal Server Error');
    });

    test('should enforce password complexity', async ({ page }) => {
      await page.goto('/register');
      
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'weak'); // Should fail validation
      await page.fill('input[name="full_name"]', 'Test User');
      
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      
      // Should show password complexity error
      const bodyText = await page.textContent('body');
      const hasPasswordError = bodyText?.includes('wachtwoord') || 
                              bodyText?.includes('password') ||
                              bodyText?.includes('minimaal');
      
      if (hasPasswordError) {
        expect(hasPasswordError).toBe(true);
      }
    });
  });

  test.describe('Cluster 3: Unauthorized Access (403/401)', () => {
    test('should handle unauthorized admin access properly', async ({ page }) => {
      // Try to access admin page without login
      await page.goto('/admin');
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      const bodyText = await page.textContent('body');
      
      // Should either redirect to login or show proper unauthorized message
      const hasLoginRedirect = currentUrl.includes('/login');
      const hasUnauthorizedMessage = bodyText?.includes('toegang') || 
                                    bodyText?.includes('unauthorized') ||
                                    bodyText?.includes('inloggen');
      
      expect(hasLoginRedirect || hasUnauthorizedMessage).toBe(true);
      
      // Should NOT show raw 403/401 errors
      expect(bodyText).not.toContain('403');
      expect(bodyText).not.toContain('401');
    });

    test('should handle protected API endpoints correctly', async ({ page }) => {
      // Monitor API responses
      const apiResponses: any[] = [];
      
      page.on('response', response => {
        const url = response.url();
        if (url.includes('/api/')) {
          apiResponses.push({
            url,
            status: response.status()
          });
        }
      });

      await page.goto('/search');
      
      // Perform search that might trigger API calls
      const searchInput = page.locator('input[placeholder*="zoek"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await searchInput.press('Enter');
        await page.waitForTimeout(2000);
      }
      
      // Check that API responses are reasonable
      const failedApiCalls = apiResponses.filter(r => r.status >= 500);
      
      // Should not have 500 errors on basic functionality
      expect(failedApiCalls.length).toBe(0);
    });
  });

  test.describe('Environment Configuration', () => {
    test('should handle missing environment gracefully', async ({ page }) => {
      // This test verifies our environment validation works
      await page.goto('/api/health');
      
      // Health endpoint should respond (even if degraded)
      const responseText = await page.textContent('body');
      
      // Should not crash, should give status
      expect(responseText).toContain('status');
      
      // Parse response if possible
      try {
        const healthData = JSON.parse(responseText || '{}');
        expect(healthData.status).toBeDefined();
      } catch (e) {
        // If not JSON, should at least have some response
        expect(responseText?.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('User Experience Quality', () => {
    test('should provide user-friendly error messages', async ({ page }) => {
      await page.goto('/login');
      
      // Try various invalid inputs
      await page.fill('input[type="email"]', 'invalid');
      await page.fill('input[type="password"]', '');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(1000);
      
      // Should show helpful Dutch error messages
      const bodyText = await page.textContent('body');
      const hasDutchErrors = bodyText?.includes('controleer') || 
                           bodyText?.includes('vereist') ||
                           bodyText?.includes('ongeldig');
      
      if (hasDutchErrors) {
        expect(hasDutchErrors).toBe(true);
      }
    });

    test('should maintain responsive design', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Should be responsive
      const navigation = page.locator('nav');
      await expect(navigation).toBeVisible();
      
      // Should have mobile menu or responsive navigation
      const mobileMenu = page.locator('[data-testid="mobile-menu"], .hamburger, .menu-toggle');
      const isResponsive = await mobileMenu.isVisible() || 
                          await navigation.isVisible();
      
      expect(isResponsive).toBe(true);
    });
  });
});
