import type { NextApiRequest, NextApiResponse } from 'next';

// Proxy to the Vercel subdomain to bypass potential custom-domain POST blocks
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

  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    const targetBase = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : '';

    if (!targetBase) {
      res.status(500).json({ error: 'Missing Vercel URL for proxy' });
      return;
    }

    const response = await fetch(`${targetBase}/api/auth/login-post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      redirect: 'manual',
    });

    // Forward Set-Cookie and Location for 303
    const setCookie = response.headers.getSetCookie?.() || (response.headers as any).raw?.()['set-cookie'];
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }
    const location = response.headers.get('location');
    if (response.status === 303 && location) {
      res.writeHead(303, { Location: location });
      res.end();
      return;
    }

    const text = await response.text();
    res.status(response.status).send(text);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Proxy error' });
  }
}


