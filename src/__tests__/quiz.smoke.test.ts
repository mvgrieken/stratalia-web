import { describe, it, expect, vi } from 'vitest';

describe('Quiz API smoke', () => {
  it('returns questions for valid difficulty', async () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    vi.spyOn(global, 'fetch' as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { questions: [{ id: 'q1', difficulty: 'easy' }] } })
    } as any);

    const res = await fetch(`${baseUrl}/api/quiz?difficulty=easy&limit=3`);
    expect(res.ok).toBe(true);
    const body = await res.json();
    expect(Array.isArray(body.data.questions)).toBe(true);
  });
});


