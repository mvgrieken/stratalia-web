import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
// removed unused normalizeError import where not needed
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

export const POST = withApiError(withZod(submitSchema, async (request: NextRequest) => {
    // Apply rate limiting to prevent spam
    const rateLimitCheck = applyRateLimit(request, 'community');
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!;
    }

    const body: CommunitySubmission = await request.json();
    const { word, definition, example, context, source } = body;
    
    logger.info(`📝 Community submission received for word: "${word}"`);
    
    // Enhanced validation
    if (!word || !definition) {
      return NextResponse.json({
        error: 'Ontbrekende verplichte velden',
        details: 'Woord en betekenis zijn verplicht'
      }, { status: 400 });
    }

    // Validate word length and content
    if (word.trim().length < 2 || word.trim().length > 50) {
      return NextResponse.json({
        error: 'Ongeldig woord',
        details: 'Woord moet tussen 2 en 50 karakters bevatten'
      }, { status: 400 });
    }

    // Validate definition length
    if (definition.trim().length < 10 || definition.trim().length > 500) {
      return NextResponse.json({
        error: 'Ongeldige betekenis',
        details: 'Betekenis moet tussen 10 en 500 karakters bevatten'
      }, { status: 400 });
    }

    // Validate example if provided
    if (example && (example.trim().length < 10 || example.trim().length > 200)) {
      return NextResponse.json({
        error: 'Ongeldig voorbeeld',
        details: 'Voorbeeldzin moet tussen 10 en 200 karakters bevatten'
      }, { status: 400 });
    }

    // Try to save to database if Supabase is configured
    if (isSupabaseConfigured()) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Get user ID from session if available
        const { data: { session } } = await supabase.auth.getSession();
        const submittedBy = session?.user?.id || null;

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
            submitted_by_name: session?.user?.user_metadata?.full_name || 'Anoniem'
          })
          .select()
          .single();

        if (error) {
          const normalized = normalizeError(error);
          logger.warn(`Database save failed, using fallback: ${normalized.message}`);
        } else {
          logger.info(`✅ Community submission created with ID: ${data.id}`);
          return NextResponse.json({
            success: true,
            message: 'Woord succesvol ingediend voor beoordeling',
            submission_id: data.id,
            source: 'database'
          });
        }
      } catch (dbError) {
        const normalized = normalizeError(dbError);
        logger.warn(`Database unavailable, using fallback: ${normalized.message}`);
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
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
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
      const normalized = normalizeError(error);
      logger.error(`❌ Error fetching community submissions: ${normalized}`);
      return NextResponse.json({
        error: 'Database unavailable',
        details: error.message
      }, { status: 500 });
    }
    
    logger.info(`✅ Found ${submissions?.length || 0} community submissions`);
    return NextResponse.json(submissions || []);
});