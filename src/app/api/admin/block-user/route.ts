import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { user_id, reason } = await request.json();
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is vereist' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabaseService = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Check admin from session
    const { data: sessionData, error: sessionError } = await supabaseService.auth.getSession();
    if (sessionError || !sessionData.session?.user) {
      return NextResponse.json({ error: 'Authenticatie vereist' }, { status: 401 });
    }

    const adminId = sessionData.session.user.id;
    const { data: admin, error: adminError } = await supabaseService
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single();

    if (adminError || admin?.role !== 'admin') {
      return NextResponse.json({ error: 'Alleen admins mogen blokkeren' }, { status: 403 });
    }

    // Update users table flag
    const { error: profileError } = await supabaseService
      .from('users')
      .update({ is_active: false })
      .eq('id', user_id);

    if (profileError) {
      logger.error(`Error updating users.is_active=false: ${profileError instanceof Error ? profileError.message : String(profileError)}`);
      return NextResponse.json({ error: 'Kon gebruikersprofiel niet bijwerken' }, { status: 500 });
    }

    // Disable authentication (Admin ban)
    try {
      await supabaseService.auth.admin.updateUserById(user_id, { ban_duration: 'forever' });
    } catch (authErr) {
      logger.warn(`Auth ban failed for ${user_id}: ${authErr instanceof Error ? authErr.message : String(authErr)}`);
    }

    // Log admin action
    await supabaseService.from('admin_actions').insert({
      admin_user_id: adminId,
      action_type: 'block_user',
      target_user_id: user_id,
      action_details: { reason },
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`Error in block-user: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
