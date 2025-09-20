import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@supabase/ssr';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow only GET to bypass custom-domain POST blocks
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
    return;
  }

  res.setHeader('Cache-Control', 'no-store');

  try {
    const authHeader = req.headers['authorization'];
    const refreshToken = (req.headers['x-refresh-token'] as string | undefined) ?? undefined;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(400).json({ error: 'Missing Authorization Bearer token' });
      return;
    }
    if (!refreshToken) {
      res.status(400).json({ error: 'Missing x-refresh-token header' });
      return;
    }

    const accessToken = authHeader.substring('Bearer '.length);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      {
        cookies: {
          get: (name) => req.cookies[name],
          set: (name, value, options) => {
            const parts: string[] = [];
            parts.push(`${name}=${value}`);
            parts.push(`Path=${options?.path ?? '/'}`);
            if (typeof options?.maxAge === 'number') parts.push(`Max-Age=${options.maxAge}`);
            parts.push('HttpOnly');
            parts.push('Secure');
            parts.push(`SameSite=${(options as any)?.sameSite ?? 'Lax'}`);
            const domain = (options as any)?.domain;
            if (domain) parts.push(`Domain=${domain}`);

            const cookieStr = parts.join('; ');
            const existing = res.getHeader('Set-Cookie');
            if (!existing) {
              res.setHeader('Set-Cookie', [cookieStr]);
            } else if (Array.isArray(existing)) {
              res.setHeader('Set-Cookie', [...existing, cookieStr]);
            } else {
              res.setHeader('Set-Cookie', [existing as string, cookieStr]);
            }
          },
          remove: (name, options) => {
            const parts: string[] = [];
            parts.push(`${name}=`);
            parts.push(`Path=${options?.path ?? '/'}`);
            parts.push('Max-Age=0');
            parts.push('HttpOnly');
            parts.push('Secure');
            parts.push('SameSite=Lax');
            const domain = (options as any)?.domain;
            if (domain) parts.push(`Domain=${domain}`);
            const cookieStr = parts.join('; ');
            const existing = res.getHeader('Set-Cookie');
            if (!existing) {
              res.setHeader('Set-Cookie', [cookieStr]);
            } else if (Array.isArray(existing)) {
              res.setHeader('Set-Cookie', [...existing, cookieStr]);
            } else {
              res.setHeader('Set-Cookie', [existing as string, cookieStr]);
            }
          }
        }
      }
    );

    const { data: setData, error: setError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken as string });
    if (setError) {
      res.status(401).json({ error: setError.message });
      return;
    }

    // Validate user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      res.status(401).json({ error: userError?.message ?? 'Invalid session' });
      return;
    }

    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Attach session failed' });
  }
}


