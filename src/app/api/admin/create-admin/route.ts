import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, admin_code } = await request.json();

    // Validate required fields
    if (!email || !password || !full_name || !admin_code) {
      return NextResponse.json({
        error: 'Email, password, full name and admin code are required'
      }, { status: 400 });
    }

    // Check admin code
    const validAdminCode = process.env.ADMIN_REGISTRATION_CODE || 'stratalia-admin-2024';
    if (admin_code !== validAdminCode) {
      logger.warn(`Invalid admin registration attempt with code: ${admin_code}`);
      return NextResponse.json({
        error: 'Ongeldige admin code'
      }, { status: 403 });
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({
        error: 'Password must be at least 8 characters long'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        error: 'Invalid email address'
      }, { status: 400 });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      logger.error('❌ Supabase environment variables are missing!');
      return NextResponse.json({
        error: 'Database configuratie ontbreekt. Neem contact op met de beheerder.'
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
      logger.error('❌ Admin registration error:', authError);
      
      let errorMessage = 'Registratie mislukt. Probeer het opnieuw.';
      
      if (authError.message.includes('User already registered')) {
        errorMessage = 'Dit e-mailadres is al geregistreerd.';
      } else if (authError.message.includes('Password should be at least')) {
        errorMessage = 'Wachtwoord moet minimaal 8 tekens lang zijn.';
      } else if (authError.message.includes('Invalid email')) {
        errorMessage = 'Ongeldig e-mailadres.';
      }
      
      return NextResponse.json({
        error: errorMessage
      }, { status: 400 });
    }

    // Guard: Check if user was created successfully
    if (!authData.user) {
      logger.error('❌ Admin user registration failed: no user data returned');
      return NextResponse.json({
        error: 'Admin registratie mislukt. Probeer het opnieuw.'
      }, { status: 400 });
    }

    // Create admin profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        full_name: full_name || '',
        role: 'admin' // Set as admin
      });

    if (profileError) {
      logger.error('❌ Admin profile creation error:', profileError);
      return NextResponse.json({
        error: 'Er is een probleem opgetreden bij het aanmaken van het admin profiel.'
      }, { status: 500 });
    }

    // Initialize admin points
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
      logger.error('❌ Admin points initialization error:', pointsError);
      // Don't fail registration for this, just log it
    }

    logger.info(`✅ Admin user created successfully: ${email}`);

    return NextResponse.json({
      message: 'Admin account created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name,
        role: 'admin'
      }
    });

  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('💥 Error in admin creation API:', normalized);
    return NextResponse.json({
      error: 'Er is een onverwachte fout opgetreden. Probeer het later opnieuw.'
    }, { status: 500 });
  }
}
