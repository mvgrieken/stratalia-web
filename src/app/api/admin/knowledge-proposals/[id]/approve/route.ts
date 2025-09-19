import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const proposalId = params.id;
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
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`Approve knowledge-proposal error: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
