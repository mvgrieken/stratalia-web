/**
 * Environment validation helpers
 * Prevents 500 errors due to missing configuration
 */

import { logger } from './logger';

export interface EnvironmentValidation {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validate required environment variables for authentication
 */
export function validateAuthEnvironment(): EnvironmentValidation {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missing = required.filter(key => {
    const value = process.env[key];
    return !value || value.startsWith('your_') || value === 'demo-key';
  });

  const warnings: string[] = [];
  
  // Check URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    warnings.push('SUPABASE_URL should use HTTPS');
  }

  // Check key lengths
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (anonKey && anonKey.length < 50) {
    warnings.push('SUPABASE_ANON_KEY appears to be invalid (too short)');
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings
  };
}

/**
 * Validate environment for production deployment
 */
export function validateProductionEnvironment(): EnvironmentValidation {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'ADMIN_TOKEN',
    'ADMIN_REGISTRATION_CODE'
  ];

  const missing = required.filter(key => {
    const value = process.env[key];
    return !value || value.startsWith('your_') || value === 'demo-key';
  });

  const warnings: string[] = [];

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://')) {
      warnings.push('APP_URL should use HTTPS in production');
    }
    
    if (process.env.ADMIN_TOKEN === 'admin-token') {
      warnings.push('ADMIN_TOKEN should be changed from default value');
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings
  };
}

/**
 * Log environment validation results
 */
export function logEnvironmentStatus(): void {
  const authValidation = validateAuthEnvironment();
  
  if (authValidation.isValid) {
    logger.info('✅ Auth environment validation passed');
  } else {
    logger.error(`❌ Auth environment validation failed. Missing: ${authValidation.missing.join(', ')}`);
  }

  if (authValidation.warnings.length > 0) {
    logger.warn(`⚠️ Environment warnings: ${authValidation.warnings.join(', ')}`);
  }

  if (process.env.NODE_ENV === 'production') {
    const prodValidation = validateProductionEnvironment();
    if (!prodValidation.isValid) {
      logger.error(`❌ Production environment validation failed. Missing: ${prodValidation.missing.join(', ')}`);
    }
  }
}

/**
 * Check if auth is properly configured
 */
export function isAuthConfigured(): boolean {
  return validateAuthEnvironment().isValid;
}

/**
 * Get user-friendly error message for missing config
 */
export function getConfigErrorMessage(): string {
  const validation = validateAuthEnvironment();
  
  if (!validation.isValid) {
    return `Database configuratie ontbreekt. Ontbrekende variabelen: ${validation.missing.join(', ')}. Neem contact op met de beheerder.`;
  }
  
  return '';
}

// Auto-validate on import in development
if (process.env.NODE_ENV === 'development') {
  logEnvironmentStatus();
}
