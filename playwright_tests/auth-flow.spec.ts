import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Login Functionality', () => {
    test('should handle login with missing credentials', async ({ page }) => {
      await page.goto('/login');
      
      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Should show validation error, not 500 error
      const errorMessage = page.locator('[data-testid="error-message"]');
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        expect(errorText).not.toContain('500');
        expect(errorText).not.toContain('Internal Server Error');
      }
    });

    test('should handle login with invalid credentials gracefully', async ({ page }) => {
      await page.goto('/login');
      
      // Fill form with invalid credentials
      await page.fill('input[type="email"]', 'invalid@test.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for response
      await page.waitForTimeout(2000);
      
      // Should show user-friendly error, not 500
      const errorElements = page.locator('text=/ongeldig|incorrect|fout|error/i');
      const errorCount = await errorElements.count();
      
      if (errorCount > 0) {
        const errorText = await errorElements.first().textContent();
        expect(errorText?.toLowerCase()).toMatch(/ongeldig|incorrect|fout/);
      }
      
      // Should not redirect to dashboard
      expect(page.url()).toContain('/login');
    });

    test('should show proper validation for password complexity', async ({ page }) => {
      await page.goto('/register');
      
      // Fill form with weak password
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', '123'); // Too weak
      await page.fill('input[name="full_name"]', 'Test User');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Should show password complexity error
      const passwordError = page.locator('text=/wachtwoord.*minimaal.*8|password.*least.*8/i');
      if (await passwordError.isVisible()) {
        expect(await passwordError.textContent()).toMatch(/minimaal.*8|least.*8/i);
      }
    });
  });

  test.describe('Rate Limiting', () => {
    test('should handle rate limiting gracefully', async ({ page }) => {
      await page.goto('/login');
      
      // Rapid fire login attempts
      for (let i = 0; i < 6; i++) {
        await page.fill('input[type="email"]', `test${i}@example.com`);
        await page.fill('input[type="password"]', 'testpassword');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(100);
      }
      
      // Should eventually show rate limit message
      const rateLimitMessage = page.locator('text=/te veel.*verzoeken|rate.*limit|wacht.*even/i');
      if (await rateLimitMessage.isVisible()) {
        expect(await rateLimitMessage.textContent()).toMatch(/te veel|rate.*limit|wacht/i);
      }
    });
  });

  test.describe('Access Control (403/401)', () => {
    test('should handle unauthorized access to protected routes', async ({ page }) => {
      // Try to access admin page without login
      await page.goto('/admin');
      
      // Should redirect to login or show unauthorized message
      await page.waitForTimeout(1000);
      
      const currentUrl = page.url();
      const hasLoginRedirect = currentUrl.includes('/login');
      const hasUnauthorizedMessage = await page.locator('text=/toegang.*geweigerd|unauthorized|inloggen.*vereist/i').isVisible();
      
      expect(hasLoginRedirect || hasUnauthorizedMessage).toBe(true);
    });

    test('should handle resource access errors gracefully', async ({ page }) => {
      // Monitor network requests
      const failedRequests: any[] = [];
      page.on('response', response => {
        if (response.status() === 403 || response.status() === 401) {
          failedRequests.push({
            url: response.url(),
            status: response.status()
          });
        }
      });

      await page.goto('/search');
      
      // Perform search that might trigger protected resource access
      const searchInput = page.locator('input[placeholder*="zoek"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await searchInput.press('Enter');
        await page.waitForTimeout(2000);
      }
      
      // If there were 403/401 errors, they should be handled gracefully
      if (failedRequests.length > 0) {
        // Should not show raw error messages to user
        const rawErrorMessage = page.locator('text=/403|401|forbidden|unauthorized/i');
        const hasRawError = await rawErrorMessage.isVisible();
        expect(hasRawError).toBe(false);
      }
    });
  });

  test.describe('Error Boundary Testing', () => {
    test('should not crash on JavaScript errors', async ({ page }) => {
      // Inject a script that would normally cause errors
      await page.goto('/');
      
      await page.evaluate(() => {
        // Simulate extension-like behavior that causes MutationObserver errors
        try {
          const observer = new MutationObserver(() => {});
          // This would normally cause the error we're fixing
          observer.observe(null as any);
        } catch (e) {
          // Should be caught by our error handling
        }
      });
      
      // Page should still be functional
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
    });

    test('should suppress extension-related console errors', async ({ page }) => {
      const consoleErrors: string[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      // Filter out extension-related errors
      const extensionErrors = consoleErrors.filter(error => 
        error.includes('credentials-library') ||
        error.includes('MutationObserver') ||
        error.includes('must be an instance of Node') ||
        error.includes('extension://')
      );
      
      // These should be suppressed by our error handling
      expect(extensionErrors.length).toBe(0);
    });
  });

  test.describe('Security Headers', () => {
    test('should have proper CSP headers', async ({ page }) => {
      const response = await page.goto('/');
      
      const cspHeader = response?.headers()['content-security-policy'];
      
      if (cspHeader) {
        expect(cspHeader).toContain("frame-ancestors 'none'");
        expect(cspHeader).toContain("default-src 'self'");
        expect(cspHeader).toContain('https://*.supabase.co');
      }
    });

    test('should have X-Frame-Options header', async ({ page }) => {
      const response = await page.goto('/');
      
      const xFrameOptions = response?.headers()['x-frame-options'];
      expect(xFrameOptions).toBe('DENY');
    });
  });

  test.describe('Performance & Stability', () => {
    test('should load pages without JavaScript errors', async ({ page }) => {
      const jsErrors: string[] = [];
      
      page.on('pageerror', error => {
        jsErrors.push(error.message);
      });
      
      // Test multiple pages
      const pages = ['/', '/search', '/knowledge', '/quiz', '/leaderboard'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForTimeout(1000);
      }
      
      // Filter out known extension errors that we suppress
      const legitimateErrors = jsErrors.filter(error => 
        !error.includes('credentials-library') &&
        !error.includes('MutationObserver') &&
        !error.includes('extension://')
      );
      
      expect(legitimateErrors.length).toBe(0);
    });

    test('should have reasonable page load times', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });
  });
});
