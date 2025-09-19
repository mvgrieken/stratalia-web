import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { withApiError } from '@/lib/api-wrapper';

export const POST = withApiError(async (_request: Request, context: any) => {
    const proposalId = context?.params?.id as string;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const { error: updateError } = await supabase
      .from('knowledge_proposals')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', proposalId);

    if (updateError) {
      logger.error(`Error approving knowledge proposal: ${updateError.message}`);
      return NextResponse.json({ error: 'Failed to approve knowledge proposal' }, { status: 500 });
    }

    // Optional: write admin_actions if table exists
    try {
      await supabase.from('admin_actions').insert({
        action: 'approve_knowledge_proposal',
        resource_id: proposalId,
      });
    } catch (logErr) {
      logger.debug(`admin_actions insert skipped: ${logErr instanceof Error ? logErr.message : String(logErr)}`);
    }

    return NextResponse.json({ success: true });
});
