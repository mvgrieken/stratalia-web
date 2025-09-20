import type { NextApiRequest, NextApiResponse } from 'next';

// Fallback: proxies login to the Vercel subdomain to bypass custom-domain POST blocks
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST,OPTIONS');
    res.status(405).json({ error: 'Method Not Allowed', method: req.method });
    return;
  }

  try {
    const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL;
    if (!vercelUrl) {
      res.status(500).json({ error: 'VERCEL_URL not configured' });
      return;
    }
    const base = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;
    const target = `${base}/api/auth/login-post`;

    const response = await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body ?? {}),
      redirect: 'manual',
    });

    // Forward Set-Cookie headers (if any)
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }

    // Forward Location for 303
    const location = response.headers.get('location');
    if (response.status === 303 && location) {
      res.writeHead(303, { Location: location });
      res.end();
      return;
    }

    const text = await response.text();
    res.status(response.status).send(text);
  } catch (e: any) {
    console.error(`[proxy-login] error: ${e?.message || e}`);
    res.status(502).json({ error: 'Bad gateway' });
  }
}


