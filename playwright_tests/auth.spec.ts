import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('/login');
  });

  test('should display login form correctly', async ({ page }) => {
    // Check if login form elements are present
    await expect(page.locator('h1')).toContainText('Inloggen');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error for empty email', async ({ page }) => {
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Check for validation error
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('should show error for empty password', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    
    // Check for validation error
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Check for validation error
    await expect(page.locator('text=Invalid email address')).toBeVisible();
  });

  test('should show user-friendly error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Check for user-friendly error message
    await expect(page.locator('text=Ongeldige inloggegevens')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.click('text=Account aanmaken');
    await expect(page).toHaveURL('/register');
  });

  test('should navigate back to home from login', async ({ page }) => {
    await page.click('text=Terug naar home');
    await expect(page).toHaveURL('/');
  });
});

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the register page before each test
    await page.goto('/register');
  });

  test('should display registration form correctly', async ({ page }) => {
    // Check if registration form elements are present
    await expect(page.locator('h1')).toContainText('Account aanmaken');
    await expect(page.locator('input[name="full_name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error for empty full name', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Check for validation error
    await expect(page.locator('text=Full name is required')).toBeVisible();
  });

  test('should show error for short password', async ({ page }) => {
    await page.fill('input[name="full_name"]', 'Test User');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'short');
    await page.click('button[type="submit"]');
    
    // Check for validation error
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.fill('input[name="full_name"]', 'Test User');
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Check for validation error
    await expect(page.locator('text=Invalid email address')).toBeVisible();
  });

  test('should show user-friendly error for existing email', async ({ page }) => {
    // This test assumes there's already a user with this email
    await page.fill('input[name="full_name"]', 'Test User');
    await page.fill('input[type="email"]', 'existing@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Check for user-friendly error message
    await expect(page.locator('text=Dit e-mailadres is al geregistreerd')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=Al een account? Inloggen');
    await expect(page).toHaveURL('/login');
  });

  test('should navigate back to home from register', async ({ page }) => {
    await page.click('text=Terug naar home');
    await expect(page).toHaveURL('/');
  });
});

test.describe('Authentication Error Handling', () => {
  test('should handle server configuration errors gracefully', async ({ page }) => {
    // Mock the API to return a server configuration error
    await page.route('/api/auth/login', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Er is een technisch probleem opgetreden. Probeer het later opnieuw.'
        })
      });
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Check for user-friendly error message
    await expect(page.locator('text=Er is een technisch probleem opgetreden')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock the API to fail with a network error
    await page.route('/api/auth/login', async route => {
      await route.abort('failed');
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Check for user-friendly error message
    await expect(page.locator('text=Verbindingsprobleem')).toBeVisible();
  });
});

test.describe('Authentication Success Flow', () => {
  test('should successfully login with valid credentials', async ({ page }) => {
    // Mock successful login
    await page.route('/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            full_name: 'Test User',
            role: 'user'
          },
          session: {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token'
          }
        })
      });
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard or home after successful login
    await expect(page).toHaveURL('/dashboard');
  });

  test('should successfully register with valid credentials', async ({ page }) => {
    // Mock successful registration
    await page.route('/api/auth/register', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Registration successful',
          user: {
            id: 'test-user-id',
            email: 'newuser@example.com',
            full_name: 'New User',
            role: 'user'
          }
        })
      });
    });

    await page.goto('/register');
    await page.fill('input[name="full_name"]', 'New User');
    await page.fill('input[type="email"]', 'newuser@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard or home after successful registration
    await expect(page).toHaveURL('/dashboard');
  });
});
