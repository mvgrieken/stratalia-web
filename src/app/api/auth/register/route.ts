import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

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
      console.error('❌ Supabase environment variables are missing!');
      return NextResponse.json({
        error: 'Server configuration error'
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
      console.error('❌ Registration error:', authError);
      return NextResponse.json({
        error: 'Registration failed',
        details: authError.message
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
      console.error('❌ Profile creation error:', profileError);
      return NextResponse.json({
        error: 'Profile creation failed',
        details: profileError.message
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
      console.error('❌ User points initialization error:', pointsError);
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
    console.error('💥 Error in registration API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
