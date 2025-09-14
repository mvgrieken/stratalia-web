import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface RegisterRequest {
  email: string;
  password: string;
  display_name: string;
  age?: number;
  location?: string;
  interests?: string[];
  learning_goals?: string[];
}

interface RegisterResponse {
  success: boolean;
  user_id?: string;
  message: string;
  requires_verification?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, password, display_name, age: _age, location: _location, interests: _interests, learning_goals: _learning_goals } = body;

    // Validation
    if (!email || !password || !display_name) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email, password en display name zijn verplicht' 
      }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ 
        success: false, 
        message: 'Wachtwoord moet minimaal 8 karakters lang zijn' 
      }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Ongeldig email adres' 
      }, { status: 400 });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase environment variables are missing!');
      return NextResponse.json({
        success: false,
        message: 'Database configuration missing'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Real registration with Supabase
    const registrationResult = await registerUser(body, supabase);

    return NextResponse.json(registrationResult);
  } catch (error) {
    console.error('Error in user registration:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Registratie mislukt. Probeer het opnieuw.' 
    }, { status: 500 });
  }
}

async function registerUser(userData: RegisterRequest, supabase: any): Promise<RegisterResponse> {
  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userData.email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing user:', checkError);
      return {
        success: false,
        message: 'Er is een fout opgetreden bij het controleren van je account.'
      };
    }

    if (existingUser) {
      return {
        success: false,
        message: 'Er bestaat al een account met dit email adres.'
      };
    }

    // Create new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        name: userData.display_name,
        email: userData.email,
        age: userData.age,
        location: userData.location,
        interests: userData.interests,
        learning_goals: userData.learning_goals,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating user:', insertError);
      return {
        success: false,
        message: 'Er is een fout opgetreden bij het aanmaken van je account.'
      };
    }

    // Initialize user points
    const { error: pointsError } = await supabase
      .from('user_points')
      .insert({
        user_id: newUser.id,
        total_points: 0,
        level: 1,
        current_streak: 0,
        longest_streak: 0
      });

    if (pointsError) {
      console.error('❌ Error creating user points:', pointsError);
      // Don't fail registration for this, just log it
    }

    return {
      success: true,
      message: 'Registratie succesvol! Welkom bij Stratalia!',
      user_id: newUser.id,
      requires_verification: false
    };

  } catch (error) {
    console.error('❌ Error in registerUser:', error);
    return {
      success: false,
      message: 'Er is een onverwachte fout opgetreden.'
    };
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
