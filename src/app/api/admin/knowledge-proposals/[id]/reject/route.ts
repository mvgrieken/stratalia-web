import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const proposalId = params.id;
    const { reason } = await request.json().catch(() => ({ reason: null }));

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const { error: updateError } = await supabase
      .from('knowledge_proposals')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString(), moderator_comment: reason })
      .eq('id', proposalId);

    if (updateError) {
      logger.error(`Error rejecting knowledge proposal: ${updateError.message}`);
      return NextResponse.json({ error: 'Failed to reject knowledge proposal' }, { status: 500 });
    }

    // Optional audit log
    try {
      await supabase.from('admin_actions').insert({
        action: 'reject_knowledge_proposal',
        resource_id: proposalId,
        notes: reason
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`Reject knowledge-proposal error: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
