import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, email, full_name, avatar_url, auth_provider } = body;

    if (!user_id || !email) {
      return NextResponse.json({
        error: 'User ID and email are required'
      }, { status: 400 });
    }

    // Initialize Supabase client with service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      logger.error('Missing Supabase environment variables for profile creation');
      return NextResponse.json({
        error: 'Database configuratie ontbreekt'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, role, full_name, avatar_url')
      .eq('id', user_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
      logger.error(`Error checking existing profile: ${checkError instanceof Error ? checkError.message : String(checkError)}`);
      return NextResponse.json({
        error: 'Fout bij controleren van profiel'
      }, { status: 500 });
    }

    if (existingProfile) {
      // Profile exists, update last login method and avatar if provided
      const updates: any = {
        last_login_method: auth_provider || 'oauth',
        last_activity_at: new Date().toISOString()
      };

      if (avatar_url && !existingProfile.avatar_url) {
        updates.avatar_url = avatar_url;
      }

      // Update full_name if it's empty or generic
      if (full_name && (!existingProfile.full_name || 
          existingProfile.full_name === 'Gebruiker' || 
          existingProfile.full_name.length < 2)) {
        updates.full_name = full_name;
      }

      await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user_id);

      logger.info(`Profile updated for OAuth user: ${email}`);
      
      return NextResponse.json({
        message: 'Profile updated successfully',
        profile: existingProfile
      });
    }

    // Create new profile for OAuth user
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user_id,
        email: email,
        full_name: full_name || 'Gebruiker',
        role: 'user',
        avatar_url: avatar_url,
        last_login_method: auth_provider || 'oauth',
        preferred_auth_method: 'oauth',
        created_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      logger.error(`Error creating OAuth profile: ${createError instanceof Error ? createError.message : String(createError)}`);
      return NextResponse.json({
        error: 'Fout bij aanmaken van profiel'
      }, { status: 500 });
    }

    // Initialize user points for new OAuth user
    const { error: pointsError } = await supabase
      .from('user_points')
      .insert({
        user_id: user_id,
        total_points: 0,
        current_level: 1,
        current_streak: 0,
        longest_streak: 0
      });

    if (pointsError) {
      logger.warn(`Failed to initialize points for OAuth user: ${pointsError?.message || 'Unknown error'}`);
      // Don't fail the request for this
    }

    logger.info(`New OAuth profile created: ${email} via ${auth_provider}`);

    return NextResponse.json({
      message: 'Profile created successfully',
      profile: newProfile
    });

  } catch (error) {
    const normalized = normalizeError(error);
    logger.error(`Error in ensure-profile API: ${normalized}`);
    
    return NextResponse.json({
      error: 'Er is een fout opgetreden bij het verwerken van je profiel'
    }, { status: 500 });
  }
}
