/**
 * Centralized Supabase client factory
 * Eliminates duplicate client creation across API routes
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config, isSupabaseConfigured } from './config';

// Re-export for backward compatibility
export { isSupabaseConfigured };
import { logger } from './logger';

export type SupabaseClientType = 'anon' | 'service';

class SupabaseClientFactory {
  private clients: Map<string, SupabaseClient> = new Map();

  /**
   * Get Supabase client instance
   * @param type - Client type ('anon' for public, 'service' for admin)
   * @returns Supabase client instance
   */
  getClient(type: SupabaseClientType = 'anon'): SupabaseClient {
    const cacheKey = `${type}-${config.supabase.url}`;
    
    if (this.clients.has(cacheKey)) {
      return this.clients.get(cacheKey)!;
    }

    if (!isSupabaseConfigured()) {
      logger.warn(`Supabase not configured, using fallback mode: type=${type}`);
      return this.createFallbackClient();
    }

    const client = this.createClient(type);
    this.clients.set(cacheKey, client);
    
    logger.debug(`Created new Supabase client: type=undefined, url=config.supabase.url`);
    return client;
  }

  private createClient(type: SupabaseClientType): SupabaseClient {
    const url = config.supabase.url;
    const key = type === 'service' 
      ? config.supabase.serviceRoleKey || config.supabase.anonKey
      : config.supabase.anonKey;

    if (!key) {
      throw new Error(`Missing ${type} key for Supabase client`);
    }

    return createClient(url, key, {
      auth: {
        persistSession: false, // For server-side usage
        autoRefreshToken: false,
      },
    });
  }

  private createFallbackClient(): SupabaseClient {
    // Return a mock client that always fails gracefully
    return {
      from: () => ({
        select: () => ({
          eq: () => ({ data: null, error: { message: 'Supabase not configured' } }),
          ilike: () => ({ data: null, error: { message: 'Supabase not configured' } }),
          or: () => ({ data: null, error: { message: 'Supabase not configured' } }),
          limit: () => ({ data: null, error: { message: 'Supabase not configured' } }),
          single: () => ({ data: null, error: { message: 'Supabase not configured' } }),
          order: () => ({ data: null, error: { message: 'Supabase not configured' } }),
          is: () => ({ data: null, error: { message: 'Supabase not configured' } }),
        }),
        insert: () => ({ data: null, error: { message: 'Supabase not configured' } }),
        update: () => ({ data: null, error: { message: 'Supabase not configured' } }),
        delete: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      }),
      rpc: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      auth: {
        getUser: () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
        signInWithPassword: () => ({ data: null, error: { message: 'Supabase not configured' } }),
        signUp: () => ({ data: null, error: { message: 'Supabase not configured' } }),
        signOut: () => ({ error: { message: 'Supabase not configured' } }),
      },
    } as any;
  }

  /**
   * Clear client cache (useful for testing)
   */
  clearCache(): void {
    this.clients.clear();
    logger.debug('Supabase client cache cleared');
  }
}

// Singleton instance
export const supabaseClientFactory = new SupabaseClientFactory();

// Convenience exports
export const getSupabaseClient = (type: SupabaseClientType = 'anon') => 
  supabaseClientFactory.getClient(type);

export const getSupabaseServiceClient = () => 
  supabaseClientFactory.getClient('service');
