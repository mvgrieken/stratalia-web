import { describe, it, expect, vi } from 'vitest';

describe('Quiz Submit API smoke', () => {
  it('accepts valid quiz submission and returns an id', async () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    vi.spyOn(global, 'fetch' as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, id: 'fallback-123' })
    } as any);

    const res = await fetch(`${baseUrl}/api/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: 3, totalQuestions: 5, difficulty: 'easy', timeTaken: 120 })
    });

    expect(res.ok).toBe(true);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(typeof body.id).toBe('string');
  });
});


