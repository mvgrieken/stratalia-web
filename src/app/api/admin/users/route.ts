import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Get current user from session
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = getSupabaseServiceClient();
    
    // Get session from cookies
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';

    logger.info(`Admin ${session.user.email} fetching users list`);

    // Build query
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add search filter if provided
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query;

    if (error) {
      logger.error('Error fetching users:', error instanceof Error ? error : new Error(String(error)));
      return NextResponse.json({ error: 'Failed to fetch users', details: error.message }, { status: 500 });
    }

    // Get additional auth data for each user
    const usersWithAuthData = await Promise.all(
      (users || []).map(async (user) => {
        try {
          const { data: authUser } = await supabase.auth.admin.getUserById(user.id);
          return {
            ...user,
            last_sign_in_at: authUser?.user?.last_sign_in_at,
            is_active: authUser?.user?.email_confirmed_at ? true : false
          };
        } catch (authError) {
          logger.warn(`Could not fetch auth data for user ${user.id}:`, authError);
          return {
            ...user,
            last_sign_in_at: null,
            is_active: false
          };
        }
      })
    );

    logger.info(`Found ${count} users`);
    return NextResponse.json({ 
      users: usersWithAuthData,
      total: count,
      limit,
      offset
    });

  } catch (error) {
    logger.error('Error in /api/admin/users GET:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}