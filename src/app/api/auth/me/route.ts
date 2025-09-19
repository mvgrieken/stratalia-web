import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { withApiError } from '@/lib/api-wrapper';
export const GET = withApiError(async () => {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ user: null });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    
    // Get session from cookies
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
