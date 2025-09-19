import { NextRequest, NextResponse } from 'next/server';
import { withApiError } from '@/lib/api-wrapper';
import { getServerSupabase } from '@/lib/supabase-server';

export const GET = withApiError(async (request: NextRequest) => {
    const supabase = getServerSupabase(request);
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      return NextResponse.json({ user: null });
    }
    
    const user = session.user;
    // Get user profile from users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      // Return user data even if profile doesn't exist
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || '',
          role: 'user'
        }
      });
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: profile.name || user.user_metadata?.full_name || '',
        role: profile.role || 'user'
      }
    });
});
