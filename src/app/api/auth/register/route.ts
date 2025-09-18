import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
import { validateRegistration } from '@/lib/validation';
import { applyRateLimit } from '@/middleware/rateLimiter';
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for auth endpoints
    const rateLimitCheck = applyRateLimit(request, 'auth');
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!;
    }

    const body = await request.json();
    
    // Simple validation for debugging
    const { email, password, full_name } = body;
    
    if (!email || !password || !full_name) {
      return NextResponse.json({
        error: 'Email, password en naam zijn verplicht'
      }, { status: 400 });
    }
    
    logger.info(`🔐 Registration data received: email=${email}, full_name=${full_name}`);
    // CRITICAL: Use ANON key for user registration (not service key!)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error('❌ Supabase environment variables are missing!');
      return NextResponse.json({
        error: 'Database configuratie ontbreekt. Neem contact op met de beheerder.'
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    
    // Service client for profile operations
    const supabaseService = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false }
    });
    // Create user account
    logger.info(`🔐 Attempting registration for: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name
        }
      }
    });
    
    logger.info(`🔐 Registration response - Success: ${!!authData.user}, Error: ${!!authError}`);
    if (authError) {
      logger.error(`❌ Registration error: ${authError.message || String(authError)}`);
      
      // Return the EXACT Supabase error for debugging
      return NextResponse.json({
        error: `Supabase error: ${authError.message}`,
        details: authError
      }, { status: 400 });
    }
    // Guard: Check if user was created successfully
    if (!authData.user) {
      logger.error('❌ User registration failed: no user data returned');
      return NextResponse.json({
        error: 'Registratie mislukt. Probeer het opnieuw.'
      }, { status: 400 });
    }
    // Create user profile (use service client for profile creation)
    const { error: profileError } = await supabaseService
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        name: full_name || ''
      });
    if (profileError) {
      logger.error('❌ Profile creation error:', profileError);
      return NextResponse.json({
        error: 'Er is een probleem opgetreden bij het aanmaken van je profiel. Probeer het opnieuw.'
      }, { status: 500 });
    }
    // Initialize user points (use service client)
    const { error: pointsError } = await supabaseService
      .from('user_points')
      .insert({
        user_id: authData.user.id,
        points: 0,
        level: 1
      });
    if (pointsError) {
      logger.error('❌ User points initialization error:', pointsError);
      // Don't fail registration for this, just log it
    }
    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: full_name
      }
    });
  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('💥 Error in registration API:', normalized);
    return NextResponse.json({
      error: 'Er is een onverwachte fout opgetreden. Probeer het later opnieuw.'
    }, { status: 500 });
  }
}
// Email validation now handled by Zod schema in validateRegistration
