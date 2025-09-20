import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST,OPTIONS');
    res.status(405).json({ error: 'Method Not Allowed', method: req.method });
    return;
  }
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: true, method: req.method, ts: Date.now() });
}


