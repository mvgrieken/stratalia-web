import type { NextApiRequest, NextApiResponse } from 'next';

// Simple relay endpoint: Vercel → GitHub repository_dispatch
// Security: require a shared token via header 'x-webhook-token' matching env VERCEL_WEBHOOK_TOKEN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const tokenHeader = req.headers['x-webhook-token'];
  const expected = process.env.VERCEL_WEBHOOK_TOKEN;
  if (!expected || !tokenHeader || tokenHeader !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const ghToken = process.env.GITHUB_DISPATCH_TOKEN;
  if (!owner || !repo || !ghToken) {
    return res.status(500).json({ error: 'GitHub dispatch env not configured' });
  }

  try {
    const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${ghToken}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_type: 'vercel-deploy-completed' }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(502).json({ error: 'GitHub dispatch failed', details: text });
    }

    return res.status(204).end();
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Dispatch error' });
  }
}


