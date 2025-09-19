import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { withApiError, withZod } from '@/lib/api-wrapper';
import { z } from 'zod';

const schema = z.object({ reason: z.string().optional() });

export const POST = withApiError(withZod(schema, async (request: Request, context: any) => {
    const proposalId = context?.params?.id as string;
    const { reason } = await (request as any).json().catch(() => ({ reason: null }));

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
    } catch (logErr) {
      logger.debug(`admin_actions insert skipped: ${logErr instanceof Error ? logErr.message : String(logErr)}`);
    }

    return NextResponse.json({ success: true });
}));
