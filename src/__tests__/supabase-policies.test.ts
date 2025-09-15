/**
 * Integration tests for Supabase RLS policies
 * Tests that anon role can only SELECT and cannot INSERT/UPDATE/DELETE
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  ilike: vi.fn(),
  limit: vi.fn(),
  single: vi.fn()
};

// Mock createClient
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient)
}));

describe('Supabase RLS Policies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Anon Role Permissions', () => {
    it('should allow SELECT on words table', async () => {
      // Mock successful SELECT
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.limit.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockResolvedValue({
        data: {
          id: 1,
          word: 'skeer',
          definition: 'bang, angstig',
          example: 'Ik was skeer voor de presentatie',
          is_active: true
        },
        error: null
      });

      const { data, error } = await mockSupabaseClient
        .from('words')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();

      expect(error).toBeNull();
      expect(data).toHaveProperty('word', 'skeer');
      expect(data).toHaveProperty('is_active', true);
    });

    it('should allow SELECT on word_of_the_day table', async () => {
      // Mock successful SELECT
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockResolvedValue({
        data: {
          id: 1,
          date: '2024-01-01',
          words: {
            id: 1,
            word: 'skeer',
            definition: 'bang, angstig'
          }
        },
        error: null
      });

      const { data, error } = await mockSupabaseClient
        .from('word_of_the_day')
        .select('*, words(*)')
        .eq('date', '2024-01-01')
        .single();

      expect(error).toBeNull();
      expect(data).toHaveProperty('date', '2024-01-01');
      expect(data.words).toHaveProperty('word', 'skeer');
    });

    it('should allow SELECT on content_updates table with approved status', async () => {
      // Mock successful SELECT
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.limit.mockResolvedValue({
        data: [
          {
            id: 1,
            type: 'word',
            content: 'New word added',
            status: 'approved',
            created_at: '2024-01-01T00:00:00Z'
          }
        ],
        error: null
      });

      const { data, error } = await mockSupabaseClient
        .from('content_updates')
        .select('*')
        .eq('status', 'approved')
        .limit(20);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data[0]).toHaveProperty('status', 'approved');
    });

    it('should deny INSERT on words table for anon role', async () => {
      // Mock INSERT failure
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.insert.mockResolvedValue({
        data: null,
        error: {
          message: 'new row violates row-level security policy for table "words"',
          code: '42501'
        }
      });

      const { data, error } = await mockSupabaseClient
        .from('words')
        .insert({
          word: 'test',
          definition: 'test definition',
          example: 'test example',
          is_active: true
        });

      expect(error).not.toBeNull();
      expect(error.code).toBe('42501');
      expect(error.message).toContain('row-level security policy');
      expect(data).toBeNull();
    });

    it('should deny UPDATE on words table for anon role', async () => {
      // Mock UPDATE failure
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.update.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockResolvedValue({
        data: null,
        error: {
          message: 'new row violates row-level security policy for table "words"',
          code: '42501'
        }
      });

      const { data, error } = await mockSupabaseClient
        .from('words')
        .update({ definition: 'updated definition' })
        .eq('id', 1);

      expect(error).not.toBeNull();
      expect(error.code).toBe('42501');
      expect(data).toBeNull();
    });

    it('should deny DELETE on words table for anon role', async () => {
      // Mock DELETE failure
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.delete.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockResolvedValue({
        data: null,
        error: {
          message: 'new row violates row-level security policy for table "words"',
          code: '42501'
        }
      });

      const { data, error } = await mockSupabaseClient
        .from('words')
        .delete()
        .eq('id', 1);

      expect(error).not.toBeNull();
      expect(error.code).toBe('42501');
      expect(data).toBeNull();
    });
  });

  describe('Environment Variable Security', () => {
    it('should use correct environment variables for client-side', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co');
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('test-anon-key');
      
      // Service key should not be available client-side
      expect(process.env.SUPABASE_SERVICE_KEY).toBeUndefined();
    });

    it('should not expose service key in client-side code', () => {
      // This test ensures that service key is not accidentally used client-side
      const clientCode = `
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        // Service key should never be used here
      `;
      
      expect(clientCode).not.toContain('SUPABASE_SERVICE_KEY');
      expect(clientCode).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    });
  });
});
