import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';

// GET /api/admin/community-submissions - Haal alle community submissions op
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    logger.info(`📋 Fetching community submissions with status: ${status}`);

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      logger.error('❌ Supabase environment variables are missing!');
      return NextResponse.json({
        error: 'Database configuration missing'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from('community_submissions')
      .select(`
        *,
        submitter:submitted_by (
          id,
          name,
          email
        ),
        reviewer:reviewed_by (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: submissions, error } = await query;

    if (error) {
      const normalized = normalizeError(error);
      logger.error('❌ Error fetching community submissions:', normalized);
      return NextResponse.json({
        error: 'Database unavailable',
        details: error.message
      }, { status: 500 });
    }

    logger.info(`✅ Found ${submissions?.length || 0} community submissions`);

    return NextResponse.json({
      submissions: submissions || [],
      total: submissions?.length || 0
    });

  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('💥 Error in community submissions API:', normalized);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/admin/community-submissions - Moderate community submissions (approve/reject)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submission_id, action, review_notes, reviewer_id } = body;

    if (!submission_id || !action || !reviewer_id) {
      return NextResponse.json({
        error: 'submission_id, action, and reviewer_id are required'
      }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({
        error: 'action must be either "approve" or "reject"'
      }, { status: 400 });
    }

    logger.info(`🔍 Moderating community submission: ${submission_id} - ${action}`);

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      logger.error('❌ Supabase environment variables are missing!');
      return NextResponse.json({
        error: 'Database configuration missing'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, get the submission
    const { data: submission, error: fetchError } = await supabase
      .from('community_submissions')
      .select('*')
      .eq('id', submission_id)
      .single();

    if (fetchError || !submission) {
      logger.error('❌ Submission not found:', submission_id);
      return NextResponse.json({
        error: 'Submission not found'
      }, { status: 404 });
    }

    // Update the submission status
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const pointsAwarded = action === 'approve' ? 10 : 0;
    
    const { data: updatedSubmission, error: updateError } = await supabase
      .from('community_submissions')
      .update({
        status: newStatus,
        points_awarded: pointsAwarded,
        reviewed_by: reviewer_id,
        reviewed_at: new Date().toISOString(),
        review_notes: review_notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', submission_id)
      .select()
      .single();

    if (updateError) {
      const normalized = normalizeError(updateError);
      logger.error('❌ Error updating submission:', normalized);
      return NextResponse.json({
        error: 'Database unavailable',
        details: updateError.message
      }, { status: 500 });
    }

    // If approved, add the word to the words table
    if (action === 'approve') {
      try {
        const { data: newWord, error: createError } = await supabase
          .from('words')
          .insert({
            word: submission.word,
            meaning: submission.definition,
            example: submission.example
          })
          .select()
          .single();

        if (createError) {
          logger.error('❌ Error creating word:', createError);
          // Don't fail the moderation, just log the error
        } else {
          logger.info(`✅ Word added to database: ${newWord.id}`);
        }

        // Award points to the submitter
        if (submission.submitted_by) {
          const { error: pointsError } = await supabase
            .from('user_points')
            .upsert({
              user_id: submission.submitted_by,
              points: pointsAwarded,
              level: 1
            }, {
              onConflict: 'user_id',
              ignoreDuplicates: false
            });

          if (pointsError) {
            logger.error('❌ Error awarding points:', pointsError);
            // Don't fail the moderation, just log the error
          } else {
            logger.info(`✅ Points awarded to user: ${submission.submitted_by}`);
          }
        }
      } catch (contentError) {
        logger.error('❌ Error processing approved submission:', contentError instanceof Error ? contentError : new Error(String(contentError)));
        // Don't fail the moderation, just log the error
      }
    }

    logger.info(`✅ Community submission moderated: ${submission_id} - ${action}`);
    
    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
      action: action
    });

  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('💥 Error in community submissions moderation API:', normalized);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
