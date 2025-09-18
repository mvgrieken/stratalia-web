/**
 * Configuration utility with fallbacks
 * Ensures the app always works, even with missing environment variables
 */

interface Config {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  app: {
    url: string;
    name: string;
    isProduction: boolean;
  };
}

// Fallback values for development/demo
const FALLBACK_CONFIG: Config = {
  supabase: {
    url: 'https://demo.supabase.co',
    anonKey: 'demo-key',
  },
  app: {
    url: 'http://localhost:3000',
    name: 'Stratalia',
    isProduction: false,
  },
};

function getConfig(): Config {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const appName = process.env.NEXT_PUBLIC_APP_NAME;
  const nodeEnv = process.env.NODE_ENV;

  // Check if we have valid Supabase configuration
  const hasValidSupabase = supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'your_supabase_project_url' && 
    supabaseAnonKey !== 'your_supabase_anon_key';

  if (!hasValidSupabase) {
    logger.warn('⚠️ [CONFIG] Supabase environment variables missing or invalid. Using fallback mode.');
  }

  return {
    supabase: {
      url: supabaseUrl || FALLBACK_CONFIG.supabase.url,
      anonKey: supabaseAnonKey || FALLBACK_CONFIG.supabase.anonKey,
      serviceRoleKey: supabaseServiceKey,
    },
    app: {
      url: appUrl || FALLBACK_CONFIG.app.url,
      name: appName || FALLBACK_CONFIG.app.name,
      isProduction: nodeEnv === 'production',
    },
  };
}

export const config = getConfig();

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return !!(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'your_supabase_project_url' && 
    supabaseAnonKey !== 'your_supabase_anon_key' &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20
  );
};

// Helper to get user-friendly error message
export const getConfigErrorMessage = (): string => {
  if (!isSupabaseConfigured()) {
    return 'De database configuratie ontbreekt. Neem contact op met de beheerder.';
  }
  return '';
};
