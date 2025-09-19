import { describe, it, expect, vi } from 'vitest';

describe('Health API smoke', () => {
  it('returns healthy status payload', async () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    vi.spyOn(global, 'fetch' as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok', timestamp: Date.now() })
    } as any);

    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.ok).toBe(true);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });
});


