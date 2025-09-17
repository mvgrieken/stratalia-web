import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { normalizeError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({
        error: 'Email and password are required'
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

    // Authenticate user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      logger.error('❌ Authentication error', authError);
      
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

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      logger.error('❌ Profile fetch error', profileError);
      // Create profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: authData.user.user_metadata?.full_name || '',
          role: 'user'
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
          role: newProfile.role,
          full_name: newProfile.full_name
        },
        session: authData.session
      });
    }

    return NextResponse.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: profile.role,
        full_name: profile.full_name
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
