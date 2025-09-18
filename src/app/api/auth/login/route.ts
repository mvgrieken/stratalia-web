import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { normalizeError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { validateLogin } from '@/lib/validation';
import { applyRateLimit } from '@/middleware/rateLimiter';
import { isAuthConfigured, getConfigErrorMessage } from '@/lib/environment-check';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for auth endpoints
    const rateLimitCheck = applyRateLimit(request, 'auth');
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!;
    }

    const body = await request.json();
    
    // Validate input with Zod
    let validatedData;
    try {
      validatedData = validateLogin(body);
    } catch (validationError) {
      logger.warn(`Login validation failed: ${validationError instanceof Error ? validationError.message : String(validationError)}`);
      return NextResponse.json({
        error: 'Ongeldige inloggegevens. Controleer je e-mail en wachtwoord.'
      }, { status: 400 });
    }
    
    const { email, password } = validatedData;

    // Check environment configuration
    if (!isAuthConfigured()) {
      const errorMessage = getConfigErrorMessage();
      logger.error('❌ Auth environment validation failed');
      return NextResponse.json({
        error: errorMessage
      }, { status: 500 });
    }

    // CRITICAL: Use ANON key for user authentication (not service key!)
    // Service key is only for admin operations, not user auth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    
    logger.info('🔐 Using ANON key for user authentication (correct approach)');

    // Authenticate user
    logger.info(`🔐 Attempting login for: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    logger.info(`🔐 Login response - Success: ${!!authData.session}, Error: ${!!authError}`);

    if (authError) {
      logger.error(`❌ Authentication error: ${authError.message || String(authError)}`);
      
      // Provide user-friendly error messages based on the error type
      let errorMessage = 'Inloggen mislukt. Controleer je gegevens.';
      
      if (authError.message.includes('Invalid login credentials')) {
        errorMessage = 'Ongeldige inloggegevens. Controleer je e-mail en wachtwoord.';
      } else if (authError.message.includes('Email not confirmed')) {
        errorMessage = 'Je e-mailadres is nog niet bevestigd. Controleer je inbox.';
      } else if (authError.message.includes('Too many requests')) {
        errorMessage = 'Te veel pogingen. Wacht even voordat je opnieuw probeert.';
      }
      
      return NextResponse.json({
        error: errorMessage
      }, { status: 401 });
    }

    // Get user profile with role (use service client for profile access)
    const supabaseService = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false }
    });
    
    const { data: profile, error: profileError } = await supabaseService
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      logger.error('❌ Profile fetch error', profileError);
      // Create profile if it doesn't exist (use service client for profile creation)
      const { data: newProfile, error: createError } = await supabaseService
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.user_metadata?.full_name || ''
        })
        .select()
        .single();

      if (createError) {
        logger.error('❌ Profile creation error', createError);
        return NextResponse.json({
          error: 'Er is een probleem opgetreden bij het aanmaken van je profiel. Probeer het opnieuw.'
        }, { status: 500 });
      }

      return NextResponse.json({
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: newProfile.name
        },
        session: authData.session
      });
    }

    return NextResponse.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: profile.name
      },
      session: authData.session
    });

  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('💥 Error in login API', normalized);
    return NextResponse.json({
      error: 'Er is een onverwachte fout opgetreden. Probeer het later opnieuw.'
    }, { status: 500 });
  }
}
