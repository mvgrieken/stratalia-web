import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { applyRateLimit } from '@/middleware/rateLimiter';
import { isSupabaseConfigured } from '@/lib/config';
import { withApiError, withZod } from '@/lib/api-wrapper';
import { z } from 'zod';
interface CommunitySubmission {
  word: string;
  definition: string;
  example?: string;
  context?: string;
  source?: string;
  notes?: string;
}
const submitSchema = z.object({
  word: z.string().min(2).max(50),
  definition: z.string().min(10).max(500),
  example: z.string().min(10).max(200).optional(),
  context: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional()
});

export const POST = withApiError(withZod(submitSchema, async (request: NextRequest, validatedData: any) => {
    const { word, definition, example, context, source } = validatedData;
    
    logger.info(`📝 Community submission received for word: "${word}"`);

    // Try to save to database if Supabase is configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseServiceClient();

        // For now, allow anonymous submissions
        const submittedBy = null;

        // Insert submission
        const { data, error } = await supabase
          .from('community_submissions')
          .insert({
            word: word.trim(),
            definition: definition.trim(),
            example: example?.trim() || null,
            context: context?.trim() || null,
            source: source?.trim() || null,
            status: 'pending',
            submitted_by: submittedBy,
            submitted_by_name: 'Anoniem'
          })
          .select()
          .single();

        if (error) {
          const msg = error instanceof Error ? error.message : String(error);
          logger.error(`Database save failed: ${msg}`);
          return NextResponse.json({
            error: 'Database error',
            details: msg
          }, { status: 500 });
        }

        logger.info(`✅ Community submission created with ID: ${data.id}`);
        return NextResponse.json({
          success: true,
          message: 'Woord succesvol ingediend voor beoordeling',
          submission_id: data.id,
          source: 'database'
        });
      } catch (dbError) {
        const msg = dbError instanceof Error ? dbError.message : String(dbError);
        logger.warn(`Database unavailable, using fallback: ${msg}`);
      }
    } else {
      logger.info('Supabase not configured, using fallback mode');
    }

    // Fallback: Return success without saving (for demo/offline mode)
    const fallbackId = `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info(`Community submission processed in fallback mode: id=${fallbackId}`);
    
    return NextResponse.json({
      success: true,
      message: 'Woord succesvol ingediend (offline modus)',
      submission_id: fallbackId,
      source: 'fallback'
    });
}));
export const GET = withApiError(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'approved';
    const userId = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    logger.info(`📝 Fetching community submissions - Status: ${status}, User: ${userId}, Limit: ${limit}`);
    
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error('❌ Supabase environment variables are missing!');
      return NextResponse.json({
        error: 'Database configuration missing'
      }, { status: 500 });
    }
    
    const supabase = getSupabaseServiceClient();
    
    // Build query
    let query = supabase
      .from('community_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    // Filter by status if specified
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Filter by user if specified
    if (userId) {
      query = query.eq('submitted_by', userId);
    }
    
    const { data: submissions, error } = await query;
    
    if (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error(`❌ Error fetching community submissions: ${msg}`);
      return NextResponse.json({
        error: 'Database unavailable',
        details: msg
      }, { status: 500 });
    }
    
    logger.info(`✅ Found ${submissions?.length || 0} community submissions`);
    return NextResponse.json(submissions || []);
});