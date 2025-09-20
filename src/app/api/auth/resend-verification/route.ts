import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { withApiError, withZod } from '@/lib/api-wrapper';
import { z } from 'zod';

const resendSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres'),
});

export const POST = withApiError(withZod(resendSchema, async (request: NextRequest, validatedData: z.infer<typeof resendSchema>) => {
  const { email } = validatedData;
  
  try {
    const supabase = getSupabaseServiceClient();
    
    // Check if user exists and is not already confirmed
    const { data: authUser, error: userError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (userError || !authUser.user) {
      logger.warn(`Resend verification attempt for non-existent user: ${email}`);
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: 'Als dit e-mailadres geregistreerd is, ontvang je een verificatielink.'
      });
    }
    
    // Check if user is already confirmed
    if (authUser.user.email_confirmed_at) {
      logger.info(`Resend verification attempt for already confirmed user: ${email}`);
      return NextResponse.json({
        success: true,
        message: 'Dit e-mailadres is al bevestigd. Je kunt inloggen.'
      });
    }
    
    // Resend verification email
    const { error: resendError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?redirect_to=/dashboard`
      }
    });
    
    if (resendError) {
      logger.error(`Failed to resend verification email: ${resendError.message}`);
      return NextResponse.json({
        error: 'Verificatiemail kon niet worden verzonden. Probeer het later opnieuw.'
      }, { status: 500 });
    }
    
    logger.info(`Verification email resent for user: ${email}`);
    
    return NextResponse.json({
      success: true,
      message: 'Verificatielink is opnieuw verzonden. Controleer je e-mail (en spamfolder).'
    });
    
  } catch (error) {
    logger.error('Error in resend verification:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({
      error: 'Er is een fout opgetreden. Probeer het later opnieuw.'
    }, { status: 500 });
  }
}));
