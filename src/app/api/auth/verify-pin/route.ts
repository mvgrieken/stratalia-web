import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
import { applyRateLimit } from '@/middleware/rateLimiter';
import bcrypt from 'bcryptjs';
import { withApiError, withZod } from '@/lib/api-wrapper';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  pin: z.string().regex(/^\d{4,6}$/)
});

export const POST = withApiError(withZod(schema, async (request: NextRequest) => {
    // Apply rate limiting for PIN attempts
    const rateLimitCheck = applyRateLimit(request, 'auth');
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!;
    }

    const { email, pin } = await request.json();

    if (!email || !pin) {
      return NextResponse.json({
        error: 'E-mail en PIN zijn verplicht'
      }, { status: 400 });
    }

    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json({
        error: 'PIN moet 4-6 cijfers bevatten'
      }, { status: 400 });
    }

    // Initialize Supabase client with service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      logger.error('Missing Supabase environment variables for PIN verification');
      return NextResponse.json({
        error: 'Database configuratie ontbreekt'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find user by email and get PIN hash
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, pin_hash, login_attempts, locked_until, role, full_name')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (profileError || !profile) {
      logger.warn(`PIN login attempt for non-existent user: ${email}`);
      return NextResponse.json({
        error: 'Ongeldige inloggegevens'
      }, { status: 401 });
    }

    // Check if account is locked
    if (profile.locked_until && new Date(profile.locked_until) > new Date()) {
      const lockTime = Math.ceil((new Date(profile.locked_until).getTime() - Date.now()) / 60000);
      return NextResponse.json({
        error: `Account tijdelijk vergrendeld. Probeer over ${lockTime} minuten opnieuw.`
      }, { status: 423 });
    }

    // Check if PIN is set
    if (!profile.pin_hash) {
      return NextResponse.json({
        error: 'Geen PIN ingesteld voor dit account. Gebruik je wachtwoord om in te loggen.'
      }, { status: 400 });
    }

    // Verify PIN
    const pinValid = await bcrypt.compare(pin, profile.pin_hash);

    if (!pinValid) {
      // Increment failed attempts
      const newAttempts = (profile.login_attempts || 0) + 1;
      const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // 15 min lock after 5 attempts

      await supabase
        .from('profiles')
        .update({ 
          login_attempts: newAttempts,
          locked_until: lockUntil?.toISOString()
        })
        .eq('id', profile.id);

      logger.warn(`Failed PIN attempt ${newAttempts} for user: ${email}`);

      if (lockUntil) {
        return NextResponse.json({
          error: 'Te veel mislukte pogingen. Account vergrendeld voor 15 minuten.'
        }, { status: 423 });
      }

      return NextResponse.json({
        error: `Ongeldige PIN. Nog ${5 - newAttempts} pogingen over.`
      }, { status: 401 });
    }

    // PIN is correct, reset attempts and try to restore session
    await supabase
      .from('profiles')
      .update({ 
        login_attempts: 0,
        locked_until: null,
        last_login_method: 'pin',
        last_activity_at: new Date().toISOString()
      })
      .eq('id', profile.id);

    // Try to get user from auth.users to create session
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.id);

    if (authError || !authUser.user) {
      logger.error(`Failed to get auth user for PIN login: ${authError?.message || 'Unknown error'}`);
      return NextResponse.json({
        error: 'Sessie herstellen mislukt. Log opnieuw in met je wachtwoord.'
      }, { status: 500 });
    }

    // Generate session tokens (this is a simplified approach)
    // In production, you might want to use a more secure method
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
      }
    });

    if (sessionError) {
      logger.error(`Failed to generate session for PIN login: ${sessionError instanceof Error ? sessionError.message : String(sessionError)}`);
      return NextResponse.json({
        error: 'Sessie aanmaken mislukt. Probeer opnieuw.'
      }, { status: 500 });
    }

    logger.info(`Successful PIN login for user: ${email}`);

    return NextResponse.json({
      message: 'PIN login succesvol',
      user: {
        id: profile.id,
        email: email,
        role: profile.role,
        full_name: profile.full_name
      },
      // Note: In a real implementation, you'd want to create proper session tokens
      // This is a simplified approach for demonstration
      session_url: sessionData.properties?.action_link // Magic link for session
    });
}));
