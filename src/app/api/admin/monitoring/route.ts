import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Get current user from session for admin check
    const supabase = getSupabaseServiceClient();
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is admin
    const { data: currentProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !currentProfile || currentProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    logger.info(`Admin ${session.user.email} accessing monitoring dashboard`);

    // Get user statistics
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, role, created_at');

    if (usersError) {
      logger.error(`Error fetching users: ${usersError instanceof Error ? usersError.message : String(usersError)}`);
      return NextResponse.json({ error: 'Failed to fetch user statistics', details: usersError.message }, { status: 500 });
    }

    // Get words statistics
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id, created_at');

    if (wordsError) {
      logger.error(`Error fetching words: ${wordsError instanceof Error ? wordsError.message : String(wordsError)}`);
      return NextResponse.json({ error: 'Failed to fetch words statistics', details: wordsError.message }, { status: 500 });
    }

    // Get knowledge items statistics
    const { data: knowledgeItems, error: knowledgeError } = await supabase
      .from('knowledge_items')
      .select('id, is_active, created_at');

    if (knowledgeError) {
      logger.error(`Error fetching knowledge items: ${knowledgeError instanceof Error ? knowledgeError.message : String(knowledgeError)}`);
      return NextResponse.json({ error: 'Failed to fetch knowledge items statistics', details: knowledgeError.message }, { status: 500 });
    }

    // Get content proposals statistics
    const { data: contentProposals, error: proposalsError } = await supabase
      .from('content_proposals')
      .select('id, status, source_type, created_at');

    if (proposalsError) {
      logger.error(`Error fetching content proposals: ${proposalsError instanceof Error ? proposalsError.message : String(proposalsError)}`);
      return NextResponse.json({ error: 'Failed to fetch content proposals statistics', details: proposalsError.message }, { status: 500 });
    }

    // Get community submissions statistics
    const { data: communitySubmissions, error: submissionsError } = await supabase
      .from('community_submissions')
      .select('id, status, created_at');

    if (submissionsError) {
      logger.error(`Error fetching community submissions: ${submissionsError instanceof Error ? submissionsError.message : String(submissionsError)}`);
      return NextResponse.json({ error: 'Failed to fetch community submissions statistics', details: submissionsError.message }, { status: 500 });
    }

    // Get admin actions for activity log
    const { data: adminActions, error: actionsError } = await supabase
      .from('admin_actions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (actionsError) {
      logger.error(`Error fetching admin actions: ${actionsError instanceof Error ? actionsError.message : String(actionsError)}`);
      return NextResponse.json({ error: 'Failed to fetch admin actions', details: actionsError.message }, { status: 500 });
    }

    // Calculate statistics
    const totalUsers = users?.length || 0;
    const usersByRole = users?.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const totalWords = words?.length || 0;
    const totalKnowledgeItems = knowledgeItems?.length || 0;
    const activeKnowledgeItems = knowledgeItems?.filter(item => item.is_active).length || 0;

    const totalContentProposals = contentProposals?.length || 0;
    const proposalsByStatus = contentProposals?.reduce((acc, proposal) => {
      acc[proposal.status] = (acc[proposal.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const totalCommunitySubmissions = communitySubmissions?.length || 0;
    const submissionsByStatus = communitySubmissions?.reduce((acc, submission) => {
      acc[submission.status] = (acc[submission.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Calculate growth metrics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLast30Days = users?.filter(user => 
      new Date(user.created_at) > thirtyDaysAgo
    ).length || 0;

    const newWordsLast30Days = words?.filter(word => 
      new Date(word.created_at) > thirtyDaysAgo
    ).length || 0;

    const newKnowledgeItemsLast30Days = knowledgeItems?.filter(item => 
      new Date(item.created_at) > thirtyDaysAgo
    ).length || 0;

    const newProposalsLast30Days = contentProposals?.filter(proposal => 
      new Date(proposal.created_at) > thirtyDaysAgo
    ).length || 0;

    const newSubmissionsLast30Days = communitySubmissions?.filter(submission => 
      new Date(submission.created_at) > thirtyDaysAgo
    ).length || 0;

    return NextResponse.json({
      overview: {
        totalUsers,
        totalWords,
        totalKnowledgeItems,
        activeKnowledgeItems,
        totalContentProposals,
        totalCommunitySubmissions
      },
      users: {
        total: totalUsers,
        byRole: usersByRole,
        newLast30Days: newUsersLast30Days
      },
      content: {
        words: {
          total: totalWords,
          newLast30Days: newWordsLast30Days
        },
        knowledgeItems: {
          total: totalKnowledgeItems,
          active: activeKnowledgeItems,
          inactive: totalKnowledgeItems - activeKnowledgeItems,
          newLast30Days: newKnowledgeItemsLast30Days
        },
        proposals: {
          total: totalContentProposals,
          byStatus: proposalsByStatus,
          newLast30Days: newProposalsLast30Days
        },
        communitySubmissions: {
          total: totalCommunitySubmissions,
          byStatus: submissionsByStatus,
          newLast30Days: newSubmissionsLast30Days
        }
      },
      activity: {
        recentAdminActions: adminActions?.slice(0, 20) || [],
        totalAdminActions: adminActions?.length || 0
      },
      lastRefresh: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Error in /api/admin/monitoring GET: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}