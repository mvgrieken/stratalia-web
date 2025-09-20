import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

function serializeCookie(name: string, value: string, options: CookieOptions = {}): string {
  const segments: string[] = [`${name}=${value}`];
  if (options.domain) segments.push(`Domain=${options.domain}`);
  if (options.path) segments.push(`Path=${options.path}`); else segments.push('Path=/');
  if (options.maxAge !== undefined) segments.push(`Max-Age=${options.maxAge}`);
  if (options.expires) segments.push(`Expires=${new Date(options.expires).toUTCString()}`);
  if (options.httpOnly) segments.push('HttpOnly');
  if (options.secure) segments.push('Secure');
  if (options.sameSite) segments.push(`SameSite=${options.sameSite}`);
  return segments.join('; ');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST,OPTIONS');
    res.status(405).end('Method Not Allowed');
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!supabaseUrl || !supabaseAnonKey) {
    res.status(500).json({ error: 'Supabase configuration missing' });
    return;
  }

  const setCookies: string[] = [];
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return req.cookies[name];
      },
      set(name: string, value: string, options: CookieOptions) {
        setCookies.push(serializeCookie(name, value, options));
      },
      remove(name: string, options: CookieOptions) {
        setCookies.push(serializeCookie(name, '', { ...options, maxAge: 0 }));
      },
    },
  });

  try {
    const { email, password, redirect_to } = req.body || {};
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      res.status(401).json({ error: error.message || 'Invalid credentials' });
      return;
    }

    if (setCookies.length) {
      res.setHeader('Set-Cookie', setCookies);
    }

    const location = redirect_to || '/dashboard';
    res.writeHead(303, { Location: location });
    res.end();
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Internal error' });
  }
}


