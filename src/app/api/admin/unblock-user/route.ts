import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSupabase } from '@/lib/supabase-server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is vereist' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseService = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const supabaseServer = getServerSupabase(request);
    const { data: userData, error: userErr } = await supabaseServer.auth.getUser();
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'Authenticatie vereist' }, { status: 401 });
    }

    const adminId = userData.user.id;
    const { data: admin, error: adminError } = await supabaseService
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single();

    if (adminError || admin?.role !== 'admin') {
      return NextResponse.json({ error: 'Alleen admins mogen deblokkeren' }, { status: 403 });
    }

    const { error: profileError } = await supabaseService
      .from('users')
      .update({ is_active: true })
      .eq('id', user_id);

    if (profileError) {
      logger.error(`Error updating users.is_active=true: ${profileError instanceof Error ? profileError.message : String(profileError)}`);
      return NextResponse.json({ error: 'Kon gebruikersprofiel niet bijwerken' }, { status: 500 });
    }

    try {
      await supabaseService.auth.admin.updateUserById(user_id, { ban_duration: 'none' as any });
    } catch (authErr) {
      logger.warn(`Auth unban failed for ${user_id}: ${authErr instanceof Error ? authErr.message : String(authErr)}`);
    }

    await supabaseService.from('admin_actions').insert({
      admin_user_id: adminId,
      action_type: 'unblock_user',
      target_user_id: user_id,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`Error in unblock-user: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
