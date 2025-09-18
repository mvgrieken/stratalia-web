import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';

// POST /api/admin/moderate-content - Moderate content proposals (approve/reject)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proposal_id, action, review_notes, reviewer_id } = body;

    if (!proposal_id || !action || !reviewer_id) {
      return NextResponse.json({
        error: 'proposal_id, action, and reviewer_id are required'
      }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({
        error: 'action must be either "approve" or "reject"'
      }, { status: 400 });
    }

    logger.info(`🔍 Moderating content proposal: ${proposal_id} - ${action}`);

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

    // First, get the proposal to understand what we're moderating
    const { data: proposal, error: fetchError } = await supabase
      .from('content_proposals')
      .select('*')
      .eq('id', proposal_id)
      .single();

    if (fetchError || !proposal) {
      logger.error('❌ Proposal not found:', proposal_id);
      return NextResponse.json({
        error: 'Proposal not found'
      }, { status: 404 });
    }

    // Update the proposal status
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    
    const { data: updatedProposal, error: updateError } = await supabase
      .from('content_proposals')
      .update({
        status: newStatus,
        reviewed_by: reviewer_id,
        reviewed_at: new Date().toISOString(),
        review_notes: review_notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', proposal_id)
      .select()
      .single();

    if (updateError) {
      const normalized = normalizeError(updateError);
      logger.error('❌ Error updating proposal:', normalized);
      return NextResponse.json({
        error: 'Database unavailable',
        details: updateError.message
      }, { status: 500 });
    }

    // If approved, create the actual content item
    if (action === 'approve') {
      try {
        const proposedData = proposal.proposed_data;
        
        if (proposal.proposal_type === 'new') {
          // Create new knowledge item
          const { data: newItem, error: createError } = await supabase
            .from('knowledge_items')
            .insert({
              type: proposedData.type,
              title: proposedData.title,
              content: proposedData.content,
              author: proposedData.author || 'Community',
              category: proposedData.category,
              tags: proposedData.tags || [],
              difficulty: proposedData.difficulty || 'beginner',
              thumbnail_url: proposedData.thumbnail_url,
              video_url: proposedData.video_url,
              audio_url: proposedData.audio_url,
              duration: proposedData.duration,
              word_count: proposedData.word_count,
              is_active: true
            })
            .select()
            .single();

          if (createError) {
            logger.error('❌ Error creating knowledge item:', createError);
            // Don't fail the moderation, just log the error
          } else {
            logger.info(`✅ Knowledge item created: ${newItem.id}`);
          }
        } else if (proposal.proposal_type === 'update') {
          // Update existing knowledge item
          const { error: updateItemError } = await supabase
            .from('knowledge_items')
            .update({
              title: proposedData.title,
              content: proposedData.content,
              updated_at: new Date().toISOString()
            })
            .eq('id', proposedData.id);

          if (updateItemError) {
            logger.error('❌ Error updating knowledge item:', updateItemError);
            // Don't fail the moderation, just log the error
          } else {
            logger.info(`✅ Knowledge item updated: ${proposedData.id}`);
          }
        }
      } catch (contentError) {
        logger.error('❌ Error processing approved content:', contentError);
        // Don't fail the moderation, just log the error
      }
    }

    logger.info(`✅ Content proposal moderated: ${proposal_id} - ${action}`);
    
    return NextResponse.json({
      success: true,
      proposal: updatedProposal,
      action: action
    });

  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('💥 Error in moderate content API:', normalized);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/admin/moderate-content - Get moderation statistics
export async function GET(request: NextRequest) {
  try {
    logger.info('📊 Fetching moderation statistics');

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

    // Get counts by status
    const { data: statusCounts, error: statusError } = await supabase
      .from('content_proposals')
      .select('status')
      .then(({ data }) => {
        const counts = { pending: 0, approved: 0, rejected: 0 };
        data?.forEach(item => {
          counts[item.status as keyof typeof counts]++;
        });
        return { data: counts, error: null };
      });

    if (statusError) {
      const normalized = normalizeError(statusError);
      logger.error('❌ Error fetching status counts:', normalized);
      return NextResponse.json({
        error: 'Database unavailable',
        details: statusError.message
      }, { status: 500 });
    }

    // Get counts by type
    const { data: typeCounts, error: typeError } = await supabase
      .from('content_proposals')
      .select('proposal_type')
      .then(({ data }) => {
        const counts = { new: 0, update: 0, metadata_change: 0 };
        data?.forEach(item => {
          counts[item.proposal_type as keyof typeof counts]++;
        });
        return { data: counts, error: null };
      });

    if (typeError) {
      const normalized = normalizeError(typeError);
      logger.error('❌ Error fetching type counts:', normalized);
      return NextResponse.json({
        error: 'Database unavailable',
        details: typeError.message
      }, { status: 500 });
    }

    // Get recent activity
    const { data: recentActivity, error: activityError } = await supabase
      .from('content_proposals')
      .select('id, proposal_type, status, created_at, reviewed_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (activityError) {
      const normalized = normalizeError(activityError);
      logger.error('❌ Error fetching recent activity:', normalized);
      return NextResponse.json({
        error: 'Database unavailable',
        details: activityError.message
      }, { status: 500 });
    }

    logger.info('✅ Moderation statistics fetched successfully');

    return NextResponse.json({
      statistics: {
        status: statusCounts,
        type: typeCounts,
        total: Object.values(statusCounts).reduce((a, b) => a + b, 0)
      },
      recent_activity: recentActivity || []
    });

  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('💥 Error in moderate content GET API:', normalized);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
