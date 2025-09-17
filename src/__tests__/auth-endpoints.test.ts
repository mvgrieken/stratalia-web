import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as loginPOST } from '@/app/api/auth/login/route';
import { POST as registerPOST } from '@/app/api/auth/register/route';

// Mock dependencies
vi.mock('@/middleware/rateLimiter', () => ({
  applyRateLimit: vi.fn(() => ({ 
    allowed: true, 
    remaining: 100, 
    resetTime: Date.now() + 3600000 
  }))
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}));

describe('Auth Endpoints - Runtime Error Fixes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  });

  describe('Login Endpoint', () => {
    it('should handle missing credentials with 400 not 500', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400); // Should be 400, not 500
      expect(data.error).toContain('Ongeldige inloggegevens');
    });

    it('should handle invalid email format with validation error', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'password123'
        })
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Ongeldige inloggegevens');
    });

    it('should handle missing environment variables gracefully', async () => {
      // Remove environment variables to simulate production issue
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Database configuratie ontbreekt');
    });

    it('should apply rate limiting', async () => {
      const { applyRateLimit } = await import('@/middleware/rateLimiter');
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 3600000,
        response: new Response(JSON.stringify({
          error: 'Rate limit exceeded'
        }), { status: 429 })
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });

      const response = await loginPOST(request);
      expect(response.status).toBe(429);
    });
  });

  describe('Register Endpoint', () => {
    it('should enforce password complexity', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: '123', // Too weak
          full_name: 'Test User'
        })
      });

      const response = await registerPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Ongeldige registratiegegevens');
    });

    it('should validate email format', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'not-an-email',
          password: 'SecurePass123!',
          full_name: 'Test User'
        })
      });

      const response = await registerPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Ongeldige registratiegegevens');
    });

    it('should validate full name requirements', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'SecurePass123!',
          full_name: 'X' // Too short
        })
      });

      const response = await registerPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Ongeldige registratiegegevens');
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize XSS attempts in login', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: '<script>alert("xss")</script>@example.com',
          password: '<script>alert("xss")</script>'
        })
      });

      const response = await loginPOST(request);
      const data = await response.json();

      // Should be sanitized and return validation error
      expect(response.status).toBe(400);
      expect(data.error).not.toContain('<script>');
    });

    it('should sanitize XSS attempts in registration', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'SecurePass123!',
          full_name: '<script>alert("xss")</script>'
        })
      });

      const response = await registerPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).not.toContain('<script>');
    });
  });
});
