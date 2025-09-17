/**
 * Centralized Supabase helper functions
 * Provides consistent Supabase configuration and error handling
 */

import { createClient } from '@supabase/supabase-js';
import { config, isSupabaseConfigured } from '@/lib/config';
import { logger } from '@/lib/logger';

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfiguredHelper(): boolean {
  return isSupabaseConfigured();
}

/**
 * Create a Supabase client with proper error handling
 */
export function createSupabaseClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please check your environment variables.');
  }

  try {
    const client = createClient(config.supabase.url, config.supabase.anonKey);
    logger.info('Supabase client created successfully');
    return client;
  } catch (error) {
    logger.error('Failed to create Supabase client:', error instanceof Error ? error : new Error(String(error)));
    throw new Error('Failed to initialize Supabase client');
  }
}

/**
 * Create a Supabase client with service role key for admin operations
 */
export function createSupabaseServiceClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please check your environment variables.');
  }

  if (!config.supabase.serviceKey) {
    throw new Error('Supabase service key is not configured');
  }

  try {
    const client = createClient(config.supabase.url, config.supabase.serviceKey);
    logger.info('Supabase service client created successfully');
    return client;
  } catch (error) {
    logger.error('Failed to create Supabase service client:', error);
    throw new Error('Failed to initialize Supabase service client');
  }
}

/**
 * Execute a Supabase query with error handling
 */
export async function executeSupabaseQuery<T>(
  queryFn: (client: any) => Promise<T>,
  useServiceKey: boolean = false
): Promise<T> {
  try {
    const client = useServiceKey ? createSupabaseServiceClient() : createSupabaseClient();
    const result = await queryFn(client);
    return result;
  } catch (error) {
    logger.error('Supabase query failed:', error);
    throw error;
  }
}

/**
 * Check if a Supabase error is a configuration error
 */
export function isSupabaseConfigError(error: any): boolean {
  return error?.message?.includes('Supabase') || 
         error?.message?.includes('configuration') ||
         error?.message?.includes('environment');
}

/**
 * Get user-friendly error message for Supabase errors
 */
export function getSupabaseErrorMessage(error: any): string {
  if (isSupabaseConfigError(error)) {
    return 'Database service is temporarily unavailable. Please try again later.';
  }
  
  if (error?.message?.includes('JWT')) {
    return 'Authentication error. Please log in again.';
  }
  
  if (error?.message?.includes('permission')) {
    return 'You do not have permission to perform this action.';
  }
  
  return 'Database operation failed. Please try again.';
}

/**
 * Validate Supabase response
 */
export function validateSupabaseResponse<T>(response: { data: T | null; error: any }): T {
  if (response.error) {
    logger.error('Supabase response error:', response.error);
    throw new Error(getSupabaseErrorMessage(response.error));
  }
  
  if (response.data === null) {
    throw new Error('No data returned from database');
  }
  
  return response.data;
}

/**
 * Check if Supabase is available and responsive
 */
export async function checkSupabaseHealth(): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) {
      return false;
    }
    
    const client = createSupabaseClient();
    // Simple query to check if Supabase is responsive
    const { error } = await client.from('words').select('id').limit(1);
    
    if (error) {
      logger.warn('Supabase health check failed:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    logger.warn('Supabase health check error:', error);
    return false;
  }
}

/**
 * Get Supabase configuration status
 */
export function getSupabaseStatus(): {
  configured: boolean;
  hasUrl: boolean;
  hasAnonKey: boolean;
  hasServiceKey: boolean;
} {
  return {
    configured: isSupabaseConfigured(),
    hasUrl: !!config.supabase.url,
    hasAnonKey: !!config.supabase.anonKey,
    hasServiceKey: !!config.supabase.serviceKey
  };
}
