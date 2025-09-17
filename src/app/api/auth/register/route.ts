import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name } = await request.json();
    if (!email || !password || !full_name) {
      return NextResponse.json({
        error: 'Email, password and full name are required'
      }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({
        error: 'Password must be at least 8 characters long'
      }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({
        error: 'Invalid email address'
      }, { status: 400 });
    }
    // Initialize Supabase client with service role for auth operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      logger.error('❌ Supabase environment variables are missing!', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      });
      return NextResponse.json({
        error: 'Er is een technisch probleem opgetreden. Probeer het later opnieuw.'
      }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name
        }
      }
    });
    if (authError) {
      logger.error('❌ Registration error:', authError);
      
      // Provide user-friendly error messages based on the error type
      let errorMessage = 'Registratie mislukt. Probeer het opnieuw.';
      
      if (authError.message.includes('User already registered')) {
        errorMessage = 'Dit e-mailadres is al geregistreerd. Probeer in te loggen.';
      } else if (authError.message.includes('Password should be at least')) {
        errorMessage = 'Wachtwoord moet minimaal 8 tekens lang zijn.';
      } else if (authError.message.includes('Invalid email')) {
        errorMessage = 'Ongeldig e-mailadres. Controleer je invoer.';
      } else if (authError.message.includes('Signup is disabled')) {
        errorMessage = 'Registratie is tijdelijk uitgeschakeld. Probeer het later opnieuw.';
      }
      
      return NextResponse.json({
        error: errorMessage
      }, { status: 400 });
    }
    // Guard: Check if user was created successfully
    if (!authData.user) {
      logger.error('❌ User registration failed: no user data returned');
      return NextResponse.json({
        error: 'Registratie mislukt. Probeer het opnieuw.'
      }, { status: 400 });
    }
    // Create user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        full_name: full_name || '',
        role: 'user'
      });
    if (profileError) {
      logger.error('❌ Profile creation error:', profileError);
      return NextResponse.json({
        error: 'Er is een probleem opgetreden bij het aanmaken van je profiel. Probeer het opnieuw.'
      }, { status: 500 });
    }
    // Initialize user points
    const { error: pointsError } = await supabase
      .from('user_points')
      .insert({
        user_id: authData.user.id,
        total_points: 0,
        current_level: 1,
        current_streak: 0,
        longest_streak: 0
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
        full_name,
        role: 'user'
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
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
