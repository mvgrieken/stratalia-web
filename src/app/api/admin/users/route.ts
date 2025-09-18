import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
import { canManageUsers } from '@/lib/auth-roles';
import type { UserRole } from '@/lib/auth-roles';

export async function GET(request: NextRequest) {
  try {
    // Get current user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({
        error: 'Authenticatie vereist'
      }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase clients
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'Database configuratie ontbreekt'
      }, { status: 500 });
    }

    const supabaseAnon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    // Verify current user
    const { data: currentUserData, error: userError } = await supabaseAnon.auth.getUser(token);
    
    if (userError || !currentUserData.user) {
      return NextResponse.json({
        error: 'Ongeldige authenticatie'
      }, { status: 401 });
    }

    // Get current user's role
    const { data: currentProfile, error: profileError } = await supabaseService
      .from('profiles')
      .select('role')
      .eq('id', currentUserData.user.id)
      .single();

    if (profileError || !currentProfile) {
      return NextResponse.json({
        error: 'Gebruikersprofiel niet gevonden'
      }, { status: 404 });
    }

    // Check permissions
    if (!canManageUsers(currentProfile.role as UserRole)) {
      return NextResponse.json({
        error: 'Onvoldoende rechten voor gebruikersbeheer'
      }, { status: 403 });
    }

    // Fetch all users with their profiles
    const { data: users, error: usersError } = await supabaseService
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        role,
        created_at,
        last_activity_at,
        last_login_method,
        mfa_enabled,
        avatar_url,
        login_attempts,
        locked_until
      `)
      .order('created_at', { ascending: false });

    if (usersError) {
      logger.error('Error fetching users:', usersError);
      return NextResponse.json({
        error: 'Fout bij ophalen van gebruikers'
      }, { status: 500 });
    }

    // Log admin action
    await supabaseService
      .from('admin_actions')
      .insert({
        admin_user_id: currentUserData.user.id,
        action_type: 'view_users',
        action_details: { users_count: users?.length || 0 },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      });

    return NextResponse.json({
      users: users || [],
      total: users?.length || 0,
      current_user: {
        id: currentUserData.user.id,
        role: currentProfile.role
      }
    });

  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('Error in admin users API:', normalized);
    
    return NextResponse.json({
      error: 'Er is een fout opgetreden bij het ophalen van gebruikers'
    }, { status: 500 });
  }
}
