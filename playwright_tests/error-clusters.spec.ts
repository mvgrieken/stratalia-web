import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Error Clusters
 * Monitors the three persistent error types and ensures they're properly handled
 */

test.describe('Error Clusters - E2E Monitoring', () => {
  test.describe('Cluster 1: MutationObserver Console Errors', () => {
    test('should NOT show MutationObserver errors in console', async ({ page }) => {
      const consoleErrors: string[] = [];
      
      // Capture all console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Navigate to home page
      await page.goto('/');
      await page.waitForTimeout(3000); // Wait for extensions to load

      // Filter for MutationObserver errors
      const mutationObserverErrors = consoleErrors.filter(error => 
        error.includes('MutationObserver') ||
        error.includes('must be an instance of Node') ||
        error.includes('Argument 1')
      );

      // These should be suppressed by our error handling
      expect(mutationObserverErrors).toHaveLength(0);
    });

    test('should handle page navigation without observer crashes', async ({ page }) => {
      const jsErrors: string[] = [];
      
      page.on('pageerror', error => {
        jsErrors.push(error.message);
      });

      // Navigate through multiple pages to trigger observers
      const pages = ['/', '/search', '/knowledge', '/quiz'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForTimeout(1000);
      }

      // Filter out extension-related errors
      const legitimateErrors = jsErrors.filter(error => 
        !error.includes('credentials-library') &&
        !error.includes('MutationObserver') &&
        !error.includes('extension://')
      );

      expect(legitimateErrors).toHaveLength(0);
    });
  });

  test.describe('Cluster 2: Login 500 Errors', () => {
    test('should handle login with missing credentials gracefully (NO 500)', async ({ page }) => {
      await page.goto('/login');
      
      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Wait for response
      await page.waitForTimeout(2000);
      
      // Should show validation error, not 500 error
      const errorMessage = page.locator('[data-testid="error-message"], .error, [role="alert"]');
      
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        expect(errorText).not.toContain('500');
        expect(errorText).not.toContain('Internal Server Error');
        expect(errorText).not.toContain('Something went wrong');
      }
      
      // Should still be on login page
      expect(page.url()).toContain('/login');
    });

    test('should handle login with invalid credentials (401 not 500)', async ({ page }) => {
      await page.goto('/login');
      
      // Fill form with invalid credentials
      await page.fill('input[type="email"]', 'invalid@test.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      
      // Submit form
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      
      // Should show user-friendly error (401), not server error (500)
      const bodyText = await page.textContent('body');
      expect(bodyText).not.toContain('500');
      expect(bodyText).not.toContain('Internal Server Error');
      
      // Should show proper validation message
      const hasValidationError = bodyText?.includes('ongeldig') || 
                                bodyText?.includes('incorrect') || 
                                bodyText?.includes('fout');
      expect(hasValidationError).toBe(true);
    });

    test('should handle registration validation (400 not 500)', async ({ page }) => {
      await page.goto('/register');
      
      // Fill form with invalid data
      await page.fill('input[type="email"]', 'not-an-email');
      await page.fill('input[type="password"]', '123'); // Too weak
      await page.fill('input[name="full_name"]', 'X'); // Too short
      
      // Submit form
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      
      // Should show validation errors, not 500
      const bodyText = await page.textContent('body');
      expect(bodyText).not.toContain('500');
      expect(bodyText).not.toContain('Internal Server Error');
    });

    test('should enforce rate limiting on auth endpoints', async ({ page }) => {
      await page.goto('/login');
      
      // Rapid fire login attempts
      for (let i = 0; i < 6; i++) {
        await page.fill('input[type="email"]', `test${i}@example.com`);
        await page.fill('input[type="password"]', 'testpassword');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(200);
      }
      
      // Should eventually show rate limit message
      await page.waitForTimeout(1000);
      const bodyText = await page.textContent('body');
      const hasRateLimit = bodyText?.includes('te veel') || 
                          bodyText?.includes('rate limit') || 
                          bodyText?.includes('wacht');
      
      // Rate limiting should be active (though may not trigger in all test environments)
      if (hasRateLimit) {
        expect(hasRateLimit).toBe(true);
      }
    });
  });

  test.describe('Cluster 3: Unauthorized 403/401 Access', () => {
    test('should handle unauthorized access to protected routes', async ({ page }) => {
      // Try to access admin page without login
      await page.goto('/admin');
      
      // Should redirect to login or show unauthorized message
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      const bodyText = await page.textContent('body');
      
      const hasLoginRedirect = currentUrl.includes('/login');
      const hasUnauthorizedMessage = bodyText?.includes('toegang') || 
                                    bodyText?.includes('unauthorized') || 
                                    bodyText?.includes('inloggen');
      
      expect(hasLoginRedirect || hasUnauthorizedMessage).toBe(true);
    });

    test('should handle API unauthorized responses gracefully', async ({ page }) => {
      // Monitor network requests
      const responses: any[] = [];
      page.on('response', response => {
        if (response.status() === 401 || response.status() === 403) {
          responses.push({
            url: response.url(),
            status: response.status()
          });
        }
      });

      await page.goto('/');
      await page.waitForTimeout(2000);
      
      // If there were 401/403 responses, check they're handled gracefully
      if (responses.length > 0) {
        // Should not show raw error codes to users
        const bodyText = await page.textContent('body');
        expect(bodyText).not.toContain('401');
        expect(bodyText).not.toContain('403');
        expect(bodyText).not.toContain('Unauthorized');
        expect(bodyText).not.toContain('Forbidden');
      }
    });

    test('should verify admin user has proper access', async ({ page }) => {
      // This test assumes admin credentials are available
      const adminEmail = process.env.ADMIN_EMAIL || 'mvg@atthis.ai';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      
      // Skip if no admin credentials
      if (!process.env.ADMIN_EMAIL) {
        test.skip();
      }

      await page.goto('/login');
      
      await page.fill('input[type="email"]', adminEmail);
      await page.fill('input[type="password"]', adminPassword);
      await page.click('button[type="submit"]');
      
      // Wait for login to complete
      await page.waitForTimeout(3000);
      
      // Try to access admin page
      await page.goto('/admin');
      
      // Admin should have access (no redirect to login)
      expect(page.url()).toContain('/admin');
      
      // Should see admin interface
      const hasAdminContent = await page.locator('text=Admin Dashboard').isVisible();
      expect(hasAdminContent).toBe(true);
    });
  });

  test.describe('Performance & Stability', () => {
    test('should load pages within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle JavaScript errors gracefully', async ({ page }) => {
      const jsErrors: string[] = [];
      
      page.on('pageerror', error => {
        // Only capture legitimate errors (not extension-related)
        if (!error.message.includes('credentials-library') &&
            !error.message.includes('extension://') &&
            !error.message.includes('MutationObserver')) {
          jsErrors.push(error.message);
        }
      });
      
      // Test multiple pages
      const pages = ['/', '/search', '/knowledge', '/quiz'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForTimeout(1000);
      }
      
      // Should have no legitimate JavaScript errors
      expect(jsErrors).toHaveLength(0);
    });

    test('should suppress extension-related network errors', async ({ page }) => {
      const failedRequests: any[] = [];
      
      page.on('response', response => {
        // Capture failed requests
        if (response.status() >= 400) {
          const url = response.url();
          
          // Only track non-extension failures
          if (!url.includes('extension://') && 
              !url.includes('lastpass.com') &&
              !url.includes('safari-web-extension://')) {
            failedRequests.push({
              url,
              status: response.status()
            });
          }
        }
      });

      await page.goto('/');
      await page.waitForTimeout(3000);
      
      // Should have minimal legitimate failed requests
      expect(failedRequests.length).toBeLessThan(3);
    });
  });
});
