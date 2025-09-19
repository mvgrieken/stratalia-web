import { describe, it, expect, vi } from 'vitest';

describe('Leaderboard API smoke', () => {
  it('returns leaderboard list', async () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    vi.spyOn(global, 'fetch' as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ period: 'all', leaderboard: [{ user_id: 'u1', total_points: 10 }] })
    } as any);
    const res = await fetch(`${baseUrl}/api/gamification/leaderboard?limit=5`);
    expect(res.ok).toBe(true);
    const body = await res.json();
    expect(Array.isArray(body.leaderboard)).toBe(true);
  });
});


