import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { withApiError, withZod } from '@/lib/api-wrapper';
import { z } from 'zod';

const statusSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres'),
});

export const GET = withApiError(withZod(statusSchema, async (request: NextRequest, validatedData: z.infer<typeof statusSchema>) => {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  
  if (!email) {
    return NextResponse.json({
      error: 'E-mailadres is verplicht'
    }, { status: 400 });
  }
  
  try {
    const supabase = getSupabaseServiceClient();
    
    // Get user by email
    const { data: authUser, error: userError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (userError || !authUser.user) {
      return NextResponse.json({
        error: 'Gebruiker niet gevonden'
      }, { status: 404 });
    }
    
    const user = authUser.user;
    const isVerified = !!user.email_confirmed_at;
    const createdAt = user.created_at;
    const lastSignIn = user.last_sign_in_at;
    
    // Calculate time since registration
    const registrationTime = new Date(createdAt);
    const now = new Date();
    const hoursSinceRegistration = Math.floor((now.getTime() - registrationTime.getTime()) / (1000 * 60 * 60));
    
    return NextResponse.json({
      email: user.email,
      is_verified: isVerified,
      verified_at: user.email_confirmed_at,
      created_at: createdAt,
      last_sign_in: lastSignIn,
      hours_since_registration: hoursSinceRegistration,
      can_resend: !isVerified && hoursSinceRegistration > 0, // Allow resend after 1 hour
      needs_verification: !isVerified
    });
    
  } catch (error) {
    logger.error('Error checking verification status:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({
      error: 'Er is een fout opgetreden bij het controleren van de verificatiestatus.'
    }, { status: 500 });
  }
}));
