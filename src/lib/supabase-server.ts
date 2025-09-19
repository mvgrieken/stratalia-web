import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export function getServerSupabase(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      // No-op setters for API GET routes
      set() {},
      remove() {},
    },
  });
}


