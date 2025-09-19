import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
import { canChangeRole, canManageUsers } from '@/lib/auth-roles';
import type { UserRole } from '@/lib/auth-roles';
import { withApiError, withZod } from '@/lib/api-wrapper';
import { z } from 'zod';

const schema = z.object({
  user_id: z.string().min(1),
  new_role: z.enum(['user', 'moderator', 'admin'])
});

export const POST = withApiError(withZod(schema, async (request: NextRequest) => {
    const { user_id, new_role } = await request.json();

    if (!user_id || !new_role) {
      return NextResponse.json({
        error: 'User ID en nieuwe rol zijn verplicht'
      }, { status: 400 });
    }

    if (!['user', 'moderator', 'admin'].includes(new_role)) {
      return NextResponse.json({
        error: 'Ongeldige rol'
      }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Database configuratie ontbreekt' }, { status: 500 });
    }

    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    // Get current admin from cookies-based session
    const { data: sessionData, error: sessionError } = await supabaseService.auth.getSession();
    if (sessionError || !sessionData.session?.user) {
      return NextResponse.json({ error: 'Authenticatie vereist' }, { status: 401 });
    }

    const currentUserId = sessionData.session.user.id;

    // Fetch profiles
    const { data: profiles, error: profilesError } = await supabaseService
      .from('users')
      .select('id, role, email, name')
      .in('id', [currentUserId, user_id]);

    if (profilesError || !profiles || profiles.length !== 2) {
      return NextResponse.json({ error: 'Gebruikersprofielen niet gevonden' }, { status: 404 });
    }

    const currentProfile = profiles.find(p => p.id === currentUserId);
    const targetProfile = profiles.find(p => p.id === user_id);

    if (!currentProfile || !targetProfile) {
      return NextResponse.json({ error: 'Profiel niet gevonden' }, { status: 404 });
    }

    // Check permissions
    if (!canManageUsers(currentProfile.role as UserRole)) {
      return NextResponse.json({ error: 'Onvoldoende rechten voor gebruikersbeheer' }, { status: 403 });
    }

    // Validate role change
    const roleCheck = canChangeRole(
      currentProfile.role as UserRole,
      targetProfile.role as UserRole,
      new_role as UserRole,
      user_id === currentUserId
    );

    if (!roleCheck.allowed) {
      return NextResponse.json({ error: roleCheck.reason || 'Rol wijziging niet toegestaan' }, { status: 403 });
    }

    // Update role
    const { error: updateError } = await supabaseService
      .from('users')
      .update({ role: new_role })
      .eq('id', user_id);

    if (updateError) {
      logger.error(`Error updating user role: ${updateError instanceof Error ? updateError.message : String(updateError)}`);
      return NextResponse.json({ error: 'Fout bij wijzigen van rol' }, { status: 500 });
    }

    // Log admin action
    await supabaseService
      .from('admin_actions')
      .insert({
        admin_user_id: currentUserId,
        action_type: 'update_user_role',
        target_user_id: user_id,
        action_details: {
          old_role: targetProfile.role,
          new_role: new_role,
          target_email: targetProfile.email,
          target_name: targetProfile.name
        },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      });

    logger.info(`Role updated: ${targetProfile.email} from ${targetProfile.role} to ${new_role} by ${currentProfile.email}`);

    return NextResponse.json({
      message: 'Rol succesvol gewijzigd',
      user: {
        id: user_id,
        old_role: targetProfile.role,
        new_role: new_role
      }
    });
}));
